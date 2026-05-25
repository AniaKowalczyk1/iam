package com.example.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PermissionOverrideDto {

    private Long permissionId;
    private String effect; // GRANT / DENY
    private String reason;
}