package com.example.role;

import com.example.role.dto.RoleWithPermissionsDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
public class RoleController {

    private final RoleService roleService;
    private final RoleRepository repo;

    public RoleController(RoleService roleService, RoleRepository repo) {
        this.roleService = roleService;
        this.repo = repo;
    }

    @GetMapping
    public List<Role> getAll() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Role getRole(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
    }


    @GetMapping("/with-permissions")
    public List<RoleWithPermissionsDto> getRolesWithPermissions() {
        return roleService.getRolesWithPermissions();
    }
}