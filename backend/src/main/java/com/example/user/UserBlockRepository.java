package com.example.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserBlockRepository extends JpaRepository<UserBlock, Long> {
    Optional<UserBlock> findTopByUserIdOrderByBlockedAtDesc(Long userId);
}