package com.example.permission;

import com.example.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "user_permissions")
public class UserPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================
    // USER
    // =========================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // =========================
    // PERMISSION
    // =========================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_id")
    private Permission permission;

    // =========================
    // OVERRIDE EFFECT
    // =========================
    private String effect;
    // GRANT / DENY

    @Column(name = "granted_by")
    private Long grantedBy;

    private String reason;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
}