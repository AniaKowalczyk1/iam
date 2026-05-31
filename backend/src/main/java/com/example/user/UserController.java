package com.example.user;

import com.example.role.Role;
import com.example.security.PermissionService;
import com.example.user.dto.ResetPasswordRequest;
import com.example.user.dto.UserWithPermissionsDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserRepository userRepository;
    private final PermissionService permissionService;
    private final UserService userService;

    public UserController(UserRepository userRepository,
                          PermissionService permissionService,
                          UserService userService) {
        this.userRepository = userRepository;
        this.permissionService = permissionService;
        this.userService = userService;
    }

    @GetMapping
    public List<UserWithPermissionsDto> getUsers() {

        return userRepository.findAll().stream()
                .map(user -> {

                    Set<String> roles = user.getRoles()
                            .stream()
                            .map(Role::getName)
                            .collect(Collectors.toSet());

                    Set<String> permissions =
                            permissionService.getEffectivePermissions(user.getId());

                    return new UserWithPermissionsDto(
                            user.getId(),
                            user.getEmail(),
                            user.isBlocked(),
                            roles,
                            permissions
                    );
                })
                .toList();
    }

    @PutMapping("/{userId}/reset-password")
    public void resetPassword(
            @PathVariable Long userId,
            @RequestBody ResetPasswordRequest request
    ) {

        userService.resetPassword(userId, request.getNewPassword());
    }
}