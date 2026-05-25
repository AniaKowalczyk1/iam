package com.example.user.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateUserRequest {

    private String email;
    private String password;

    private List<String> roles;

    // employee data
    private String firstName;
    private String lastName;
    private String position;

    // org structure
    private List<Long> departmentIds;

    // optional overrides
    private List<PermissionOverrideDto> permissions;
}