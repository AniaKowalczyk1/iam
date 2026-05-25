package com.example.auth;

import java.util.Set;

public class AuthResponse {

    public String token;
    public Set<String> roles;
    public Set<String> permissions;

    public AuthResponse(String token, Set<String> roles, Set<String> permissions) {
        this.token = token;
        this.roles = roles;
        this.permissions = permissions;
    }
}