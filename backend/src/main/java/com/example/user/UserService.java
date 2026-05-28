package com.example.user;

import com.example.audit.AuditLog;
import com.example.audit.AuditLogRepository;
import com.example.department.Department;
import com.example.department.DepartmentRepository;
import com.example.employee.Employee;
import com.example.employee.EmployeeRepository;
import com.example.permission.Permission;
import com.example.permission.PermissionRepository;
import com.example.permission.UserPermission;
import com.example.permission.UserPermissionRepository;
import com.example.role.Role;
import com.example.role.RoleRepository;
import com.example.user.dto.CreateUserRequest;
import com.example.user.dto.PermissionOverrideDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;



@Service
public class UserService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final DepartmentRepository departmentRepo;
    private final EmployeeRepository employeeRepo;
    private final UserPermissionRepository userPermissionRepo;
    private final PermissionRepository permissionRepo;
    private final AuditLogRepository auditRepo;
    private final PasswordEncoder encoder;
    private final UserBlockRepository userBlockRepo;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("No authenticated user");
        }

        String email = auth.getName();

        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    public UserService(UserRepository userRepo,
                       RoleRepository roleRepo,
                       DepartmentRepository departmentRepo,
                       EmployeeRepository employeeRepo,
                       UserPermissionRepository userPermissionRepo,
                       PermissionRepository permissionRepo,
                       AuditLogRepository auditRepo,
                       PasswordEncoder encoder,
                       UserBlockRepository userBlockRepo) {

        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.departmentRepo = departmentRepo;
        this.employeeRepo = employeeRepo;
        this.userPermissionRepo = userPermissionRepo;
        this.permissionRepo = permissionRepo;
        this.auditRepo = auditRepo;
        this.encoder = encoder;
        this.userBlockRepo = userBlockRepo;
    }

    @Transactional
    public User createUser(CreateUserRequest req, Long adminId) {

        // =========================
        // 1. CHECK EXISTING USER
        // =========================
        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        // =========================
        // 2. CREATE USER
        // =========================
        User user = new User();

        user.setEmail(req.getEmail());
        user.setPasswordHash(
                encoder.encode(req.getPassword())
        );

        user.setActive(true);
        user.setBlocked(false);
        user.setFailedLoginAttempts(0);

        // =========================
        // 3. ASSIGN ROLES
        // =========================
        Set<Role> roles = new HashSet<>();

        for (String roleName : req.getRoles()) {

            Role role = roleRepo.findByName(roleName)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Role not found: " + roleName
                            ));

            roles.add(role);
        }

        user.setRoles(roles);

        userRepo.save(user);

        // =========================
        // 4. CREATE EMPLOYEE PROFILE
        // =========================
        boolean isAdmin =
                req.getRoles().contains("ADMIN");

        if (!isAdmin) {

            Employee employee = new Employee();

            employee.setUser(user);

            employee.setFirstName(req.getFirstName());
            employee.setLastName(req.getLastName());
            employee.setPosition(req.getPosition());

//            // FIRST DEPARTMENT
//            if (req.getDepartmentIds() != null
//                    && !req.getDepartmentIds().isEmpty()) {
//
//                Department dept =
//                        departmentRepo.findById(
//                                        req.getDepartmentIds().get(0)
//                                )
//                                .orElseThrow(() ->
//                                        new RuntimeException(
//                                                "Department not found"
//                                        ));
//
//                employee.setDepartment(dept);
//            }

            employeeRepo.save(employee);
        }

        // =========================
        // 5. USER ↔ DEPARTMENTS
        // =========================
        if (req.getDepartmentIds() != null) {

            for (Long depId : req.getDepartmentIds()) {

                Department dept =
                        departmentRepo.findById(depId)
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Department not found"
                                        ));

                user.getDepartments().add(dept);
            }
        }

        userRepo.save(user);

        // =========================
        // 6. USER PERMISSION OVERRIDES
        // =========================
        if (req.getPermissions() != null) {

            for (PermissionOverrideDto p : req.getPermissions()) {

                UserPermission up =
                        new UserPermission();

                // USER RELATION
                up.setUser(user);

                // PERMISSION RELATION
                Permission permission =
                        permissionRepo.findById(
                                        p.getPermissionId()
                                )
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Permission not found"
                                        ));

                up.setPermission(permission);

                // EFFECT
                up.setEffect(p.getEffect());

                // AUDIT INFO
                up.setGrantedBy(adminId);
                up.setReason(p.getReason());

                userPermissionRepo.save(up);
            }
        }

        // =========================
        // 7. AUDIT LOG
        // =========================
        AuditLog log = new AuditLog();
        adminId = getCurrentUserId();

        log.setUserId(adminId);

        log.setAction("USER_CREATED");

//        log.setEntityType("users");
//
//        log.setEntityId(user.getId());

        log.setDetails(
                "Dodano użytkownika: " + user.getEmail()
        );

        auditRepo.save(log);

        return user;
    }


    @Transactional
    public void deleteUser(Long userId, Long adminId) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String email = user.getEmail();

        // 1. DELETE USER (CASCADE handles everything)
        userRepo.delete(user);

        // 2. AUDIT LOG (after delete still OK - separate table)
        AuditLog log = new AuditLog();
        adminId = getCurrentUserId();

        log.setUserId(adminId);
        log.setAction("DELETE_USER");
        log.setDetails("Usunięto użytkownika: " + email);

        auditRepo.save(log);
    }

    @Transactional
    public void blockUser(Long targetUserId, Long actorId, String reason) {

        User user = userRepo.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isBlocked()) return;

        user.setBlocked(true);
        userRepo.save(user);

        UserBlock block = new UserBlock();
        block.setUserId(targetUserId);
        block.setBlockedBy(actorId);
        block.setReason(reason);
        block.setBlockedAt(LocalDateTime.now());

        userBlockRepo.save(block);
    }

    @Transactional
    public void unblockUser(Long targetUserId, Long actorId) {

        User user = userRepo.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setBlocked(false);
        userRepo.save(user);

        UserBlock last = userBlockRepo
                .findTopByUserIdOrderByBlockedAtDesc(targetUserId)
                .orElseThrow(() -> new RuntimeException("Block not found"));

        last.setUnblockedAt(LocalDateTime.now());
        userBlockRepo.save(last);
    }


}