package com.example.department;

import com.example.audit.AuditLog;
import com.example.audit.AuditLogRepository;
import com.example.department.dto.DepartmentWithUsersDto;
import com.example.user.User;
import com.example.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DepartmentService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditLogRepository auditRepo;

    public DepartmentService(
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            AuditLogRepository auditRepo
    ) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
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

    // moje działy
    public List<DepartmentWithUsersDto> getMyDepartments(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND));

        return user.getDepartments()
                .stream()
                .map(DepartmentMapper::toDto)
                .toList();
    }

    // wszystkie działy z użytkownikami
    public List<DepartmentWithUsersDto> getAllDepartments() {

        return departmentRepository.findAll()
                .stream()
                .map(DepartmentMapper::toDto)
                .toList();
    }

    // pojedynczy dział
    public DepartmentWithUsersDto getDepartmentById(Long id) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND));

        return DepartmentMapper.toDto(department);
    }

    @Transactional
    public Department createDepartment(Department department) {

        if (departmentRepository.existsByNameIgnoreCase(department.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Department already exists"
            );
        }

        Department savedDepartment = departmentRepository.save(department);

        // =========================
        // AUDIT LOG
        // =========================
        AuditLog log = new AuditLog();

        log.setUserId(getCurrentUserId());
        log.setAction("DEPARTMENT_CREATED");
        log.setDetails(
                "Utworzono dział: " + savedDepartment.getName()
        );

        auditRepo.save(log);

        return savedDepartment;
    }

    @Transactional
    public Department updateDepartmentName(Long departmentId, String name) {

        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Department name cannot be empty"
            );
        }

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND));

        String newName = name.trim();
        String oldName = department.getName();

        if (oldName.equalsIgnoreCase(newName)) {
            return department;
        }

        if (departmentRepository.existsByNameIgnoreCaseAndIdNot(newName, departmentId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Department already exists"
            );
        }

        department.setName(newName);

        Department savedDepartment = departmentRepository.save(department);

        // =========================
        // AUDIT LOG
        // =========================
        AuditLog log = new AuditLog();

        log.setUserId(getCurrentUserId());
        log.setAction("DEPARTMENT_UPDATED");
        log.setDetails(
                "Zmieniono nazwę działu: "
                        + oldName
                        + " -> "
                        + savedDepartment.getName()
        );

        auditRepo.save(log);

        return savedDepartment;
    }
}