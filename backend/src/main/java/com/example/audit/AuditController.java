package com.example.audit;

import com.example.audit.AuditLogDto;
import com.example.user.User;
import com.example.user.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/audit")
@CrossOrigin(origins = "http://localhost:3000")
public class AuditController {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditController(
            AuditLogRepository auditLogRepository,
            UserRepository userRepository
    ) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<AuditLogDto> getAll() {

        return auditLogRepository.findAll()
                .stream()
                .map(log -> {

                    User user = userRepository
                            .findById(log.getUserId())
                            .orElse(null);

                    String email = user != null
                            ? user.getEmail()
                            : "Unknown user";

                    return new AuditLogDto(
                            log.getId(),
                            log.getUserId(),
                            email,
                            log.getAction(),
                            log.getDetails(),
                            log.getTimestamp()
                    );
                })
                .toList();
    }
}