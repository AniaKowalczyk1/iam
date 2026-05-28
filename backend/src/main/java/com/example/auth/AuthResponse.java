package com.example.auth;

import java.util.Set;

public class AuthResponse {

    public String token;
    public Set<String> roles;
    public Set<String> permissions;
    public String firstName;
    public String lastName;
    public String email;

    public AuthResponse(String token, Set<String> roles, Set<String> permissions,String firstName, String lastName, String email) {
        this.token = token;
        this.roles = roles;
        this.permissions = permissions;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;

    }
}