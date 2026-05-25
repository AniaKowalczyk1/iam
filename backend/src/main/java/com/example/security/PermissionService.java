package com.example.security;

import com.example.permission.Permission;
import com.example.permission.UserPermission;
import com.example.permission.UserPermissionRepository;
import com.example.role.Role;
import com.example.user.*;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class PermissionService {

    private final UserRepository userRepository;
    private final UserPermissionRepository userPermissionRepository;

    public PermissionService(UserRepository userRepository,
                             UserPermissionRepository userPermissionRepository) {

        this.userRepository = userRepository;
        this.userPermissionRepository = userPermissionRepository;
    }

    public Set<String> getEffectivePermissions(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isBlocked()) {
            return new HashSet<>();
        }

        // =========================
        // 1. ROLE PERMISSIONS
        // =========================
        Set<String> permissions = new HashSet<>();

        for (Role role : user.getRoles()) {
            for (Permission p : role.getPermissions()) {
                permissions.add(p.getName());
            }
        }

        // =========================
        // 2. USER OVERRIDES (GRANT / DENY)
        // =========================
        List<UserPermission> overrides =
                userPermissionRepository.findByUserId(userId);

        for (UserPermission up : overrides) {

            String name = up.getPermission().getName();

            if ("DENY".equals(up.getEffect())) {
                permissions.remove(name);
            }

            if ("GRANT".equals(up.getEffect())) {
                permissions.add(name);
            }
        }

        return permissions;
    }
}