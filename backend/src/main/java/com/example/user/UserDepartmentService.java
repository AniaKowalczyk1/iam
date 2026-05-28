package com.example.user;

import com.example.audit.AuditLog;
import com.example.audit.AuditLogRepository;
import com.example.department.Department;
import com.example.department.DepartmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserDepartmentService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final UserDepartmentRepository userDepartmentRepository;
    private final AuditLogRepository auditRepo;

    public UserDepartmentService(
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            UserDepartmentRepository userDepartmentRepository,
            AuditLogRepository auditRepo
    ) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.userDepartmentRepository = userDepartmentRepository;
        this.auditRepo = auditRepo;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("No authenticated user");
        }

        String email = auth.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    @Transactional
    public void assignUserToDepartment(Long userId, Long departmentId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND));

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (userDepartmentRepository.existsByUser_IdAndDepartment_Id(userId, departmentId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "User already assigned to this department"
            );
        }

        UserDepartment ud = new UserDepartment();
        ud.setId(new UserDepartmentId(userId, departmentId));
        ud.setUser(user);
        ud.setDepartment(department);

        userDepartmentRepository.save(ud);

        // =========================
        // AUDIT LOG
        // =========================
        AuditLog log = new AuditLog();

        log.setUserId(getCurrentUserId());
        log.setAction("USER_ASSIGNED_TO_DEPARTMENT");
        log.setDetails(
                "Przypisano użytkownika "
                        + user.getEmail()
                        + " do działu: "
                        + department.getName()
        );

        auditRepo.save(log);
    }

    @Transactional
    public void removeUserFromDepartment(Long userId, Long departmentId) {

        UserDepartmentId id = new UserDepartmentId(userId, departmentId);

        if (!userDepartmentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        userDepartmentRepository.deleteById(id);
    }

    @Transactional
    public void removeAllUsersFromDepartment(Long departmentId) {
        userDepartmentRepository.deleteAllByDepartmentId(departmentId);
    }
}