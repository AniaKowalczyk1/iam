package com.example.user.dto;

import java.util.List;
import java.util.Set;

public record UserProfile(
        String email,
        List<String> roles,
        Set<String> permissions
) {}