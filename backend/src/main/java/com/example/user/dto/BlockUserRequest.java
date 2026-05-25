package com.example.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BlockUserRequest {
    private Long userId;
    private String reason;
}