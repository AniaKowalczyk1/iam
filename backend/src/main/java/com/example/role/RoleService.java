package com.example.role;

import com.example.role.dto.RoleWithPermissionsDto;
import com.example.permission.Permission;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public List<RoleWithPermissionsDto> getRolesWithPermissions() {
        return roleRepository.findAll()
                .stream()
                .map(role -> new RoleWithPermissionsDto(
                        role.getId(),
                        role.getName(),
                        role.getPermissions()
                                .stream()
                                .map(Permission::getName)
                                .collect(java.util.stream.Collectors.toSet())
                ))
                .toList();
    }
}