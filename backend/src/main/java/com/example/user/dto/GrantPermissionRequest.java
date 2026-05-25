package com.example.user.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class GrantPermissionRequest {

    private Long permissionId;

    private String effect;
    // GRANT / DENY

    private String reason;

    //private LocalDateTime expiresAt;
}