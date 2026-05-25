package com.example.department.dto;

import java.util.List;

public record DepartmentWithUsersDto(
        Long id,
        String name,
        List<UserDto> users
) {}