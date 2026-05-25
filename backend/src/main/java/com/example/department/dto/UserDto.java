package com.example.department.dto;

public record UserDto(
        Long id,
        String email,
        boolean active
) {}