package com.example.permission;

import com.example.audit.AuditLog;
import com.example.audit.AuditLogRepository;
import com.example.user.User;
import com.example.user.UserRepository;
import com.example.user.dto.GrantPermissionRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserPermissionService {

    private final UserRepository userRepo;
    private final PermissionRepository permissionRepo;
    private final UserPermissionRepository userPermissionRepo;
    private final AuditLogRepository auditRepo;

    public UserPermissionService(
            UserRepository userRepository,
            PermissionRepository permissionRepository,
            UserPermissionRepository userPermissionRepository,
            AuditLogRepository auditRepo
    ) {
        this.userRepo = userRepository;
        this.permissionRepo = permissionRepository;
        this.userPermissionRepo = userPermissionRepository;
        this.auditRepo = auditRepo;
    }

    @Transactional
    public void grantPermissionToUser(
            Long targetUserId,
            GrantPermissionRequest req,
            Long actorId
    ) {

        User user = userRepo.findById(targetUserId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Permission permission =
                permissionRepo.findById(req.getPermissionId())
                        .orElseThrow(() ->
                                new RuntimeException("Permission not found"));

        // CHECK EXISTING OVERRIDE
        Optional<UserPermission> existing =
                userPermissionRepo
                        .findByUser_IdAndPermission_Id(
                                targetUserId,
                                req.getPermissionId()
                        );

        UserPermission up;

        if (existing.isPresent()) {

            up = existing.get();

        } else {

            up = new UserPermission();

            up.setUser(user);
            up.setPermission(permission);
        }

        up.setEffect(req.getEffect());
        up.setReason(req.getReason());
        up.setGrantedBy(actorId);
        //up.setExpiresAt(req.getExpiresAt());

        userPermissionRepo.save(up);

        // =========================
        // AUDIT LOG
        // =========================
        AuditLog log = new AuditLog();

        log.setUserId(actorId);

        if ("DENY".equalsIgnoreCase(req.getEffect())) {

            log.setAction("USER_PERMISSION_DENIED");
            log.setDetails(
                    "Odmówiono użytkownikowi "
                            + user.getEmail()
                            + " uprawnienia: "
                            + permission.getName()
                            + formatReason(req.getReason())
            );

        } else {

            log.setAction("USER_PERMISSION_GRANTED");
            log.setDetails(
                    "Nadano użytkownikowi "
                            + user.getEmail()
                            + " uprawnienie: "
                            + permission.getName()
                            + formatReason(req.getReason())
            );
        }

        auditRepo.save(log);
    }

    @Transactional
    public void revokePermissionFromUser(
            Long targetUserId,
            Long permissionId,
            Long actorId
    ) {

        UserPermission up =
                userPermissionRepo
                        .findByUser_IdAndPermission_Id(
                                targetUserId,
                                permissionId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Permission override not found"
                                ));

        String userEmail = up.getUser().getEmail();
        String permissionName = up.getPermission().getName();

        userPermissionRepo.delete(up);

        // =========================
        // AUDIT LOG
        // =========================
        AuditLog log = new AuditLog();

        log.setUserId(actorId);
        log.setAction("USER_PERMISSION_REVOKED");
        log.setDetails(
                "Usunięto użytkownikowi "
                        + userEmail
                        + " uprawnienie: "
                        + permissionName
        );

        auditRepo.save(log);
    }

    @Transactional(readOnly = true)
    public List<UserPermission> getUserPermissions(Long userId) {

        return userPermissionRepo.findByUserId(userId);
    }

    private String formatReason(String reason) {

        if (reason == null || reason.isBlank()) {
            return "";
        }

        return ". Powód: " + reason;
    }
}