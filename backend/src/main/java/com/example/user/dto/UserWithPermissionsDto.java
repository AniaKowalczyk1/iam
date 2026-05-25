package com.example.user.dto;

import java.util.Set;

public class UserWithPermissionsDto {

    public Long id;
    public String email;
    public boolean blocked;

    public Set<String> roles;
    public Set<String> permissions;

    public UserWithPermissionsDto(Long id,
                                  String email,
                                  boolean blocked,
                                  Set<String> roles,
                                  Set<String> permissions) {
        this.id = id;
        this.email = email;
        this.blocked = blocked;
        this.roles = roles;
        this.permissions = permissions;
    }
}