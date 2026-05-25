package com.example.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String rawPassword = "manager123";

        String hash = encoder.encode(rawPassword);

        System.out.println("HASH:");
        System.out.println(hash);
    }
}