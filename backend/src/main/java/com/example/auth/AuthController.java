package com.example.auth;

import com.example.role.Role;
import com.example.role.RoleRepository;
import com.example.security.JwtService;
import com.example.security.PermissionService;
import com.example.security.RecaptchaService;
import com.example.user.*;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserRepository userRepo;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final PermissionService permissionService;
    private final RecaptchaService recaptchaService;

    public AuthController(UserRepository userRepo,
                          JwtService jwtService,
                          PasswordEncoder passwordEncoder,
                          RoleRepository roleRepository,
                          PermissionService permissionService,
                          RecaptchaService recaptchaService) {

        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.permissionService = permissionService;
        this.recaptchaService = recaptchaService;
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {


        recaptchaService.verify(req.captchaToken);

        User user = userRepo.findByEmail(req.email)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (user.isBlocked()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Twoje konto jest zablokowane"
            );
        }

        if (!passwordEncoder.matches(req.password, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        Set<String> roles = user.getRoles()
                .stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        Set<String> permissions =
                permissionService.getEffectivePermissions(user.getId());

        String token = jwtService.generateToken(user.getEmail(), permissions);

        return ResponseEntity.ok(
                new AuthResponse(token, roles, permissions)
        );
    }

    // =========================
    // REGISTER
    // =========================
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody LoginRequest req) {

        if (userRepo.findByEmail(req.email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        }

        Role role = roleRepository.findByName("EMPLOYEE")
                .orElseThrow();

        User u = new User();
        u.setEmail(req.email);
        u.setPasswordHash(passwordEncoder.encode(req.password));
        u.setRoles(Set.of(role));

        userRepo.save(u);

        Set<String> roles = Set.of("EMPLOYEE");

        Set<String> permissions =
                permissionService.getEffectivePermissions(u.getId());

        String token = jwtService.generateToken(u.getEmail(), permissions);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, roles, permissions));
    }

    // =========================
    // ME
    // =========================
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(@RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<String> roles = user.getRoles()
                .stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        Set<String> permissions =
                permissionService.getEffectivePermissions(user.getId());

        return ResponseEntity.ok(
                new AuthResponse(token, roles, permissions)
        );
    }
}