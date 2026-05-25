package com.example.permission;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permissions")
public class PermissionController {

    private final PermissionRepository permissionRepo;

    public PermissionController(PermissionRepository permissionRepo) {
        this.permissionRepo = permissionRepo;
    }

    @GetMapping
    public List<Permission> getAll() {
        return permissionRepo.findAll();
    }
}