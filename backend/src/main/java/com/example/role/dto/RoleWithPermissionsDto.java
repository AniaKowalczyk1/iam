package com.example.role.dto;

import java.util.Set;

public record RoleWithPermissionsDto(
        Long id,
        String roleName,
        Set<String> permissions
) {}