package com.example.audit;

import java.time.LocalDateTime;

public record AuditLogDto(
        Long id,
        Long userId,
        String userEmail,
        String action,
        String details,
        LocalDateTime timestamp
) {
}