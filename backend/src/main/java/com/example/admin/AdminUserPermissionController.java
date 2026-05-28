package com.example.admin;

import com.example.security.SecurityUtils;
import com.example.permission.UserPermission;
import com.example.permission.UserPermissionService;
import com.example.user.dto.GrantPermissionRequest;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
public class AdminUserPermissionController {

    private final UserPermissionService userPermissionService;
    private final SecurityUtils securityUtils;

    public AdminUserPermissionController(
            UserPermissionService userPermissionService,
            SecurityUtils securityUtils
    ) {
        this.userPermissionService = userPermissionService;
        this.securityUtils = securityUtils;
    }

    // =========================
    // GRANT / DENY
    // =========================
    @PostMapping("/{userId}/permissions")
    @PreAuthorize("hasAuthority('GRANT_PERMISSION_TO_USER')")
    public void grantPermission(
            @PathVariable Long userId,
            @Valid @RequestBody GrantPermissionRequest req
    ) {

        Long actorId =
                securityUtils.getCurrentUserId();

        userPermissionService.grantPermissionToUser(
                userId,
                req,
                actorId
        );
    }

    // =========================
    // REMOVE OVERRIDE
    // =========================
    @DeleteMapping("/{userId}/permissions/{permissionId}")
    @PreAuthorize("hasAuthority('REVOKE_PERMISSION_FROM_USER')")
    public void revokePermission(
            @PathVariable Long userId,
            @PathVariable Long permissionId
    ) {

        Long actorId = securityUtils.getCurrentUserId();

        userPermissionService.revokePermissionFromUser(
                userId,
                permissionId,
                actorId
        );
    }

    @GetMapping("/{userId}/permissions")
    @PreAuthorize("hasAuthority('VIEW_USERS')")
    public List<UserPermission> getUserPermissions(
            @PathVariable Long userId
    ) {
        return userPermissionService.getUserPermissions(userId);
    }
}