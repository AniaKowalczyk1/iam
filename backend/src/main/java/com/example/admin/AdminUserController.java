package com.example.admin;

import com.example.security.SecurityUtils;
import com.example.user.User;
import com.example.user.UserService;
import com.example.user.dto.BlockUserRequest;
import com.example.user.dto.CreateUserRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    private final UserService userService;
    private final SecurityUtils securityUtils;

    public AdminUserController(UserService userService, SecurityUtils securityUtils) {
        this.userService = userService;
        this.securityUtils = securityUtils;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_USER')")
    public User create(@RequestBody CreateUserRequest req) {

        Long actorId = securityUtils.getCurrentUserId();


        return userService.createUser(req, actorId);
    }

    @DeleteMapping("/{userId}")
    public void deleteUser(@PathVariable Long userId) {

        Long actorId = securityUtils.getCurrentUserId();

        userService.deleteUser(userId, actorId);
    }

    @PostMapping("/{userId}/block")
    @PreAuthorize("hasAuthority('BLOCK_USER')")
    public void block(@PathVariable Long userId,
                      @RequestBody BlockUserRequest req) {

        Long actorId = securityUtils.getCurrentUserId();

        userService.blockUser(userId, actorId, req.getReason());
    }

    @PostMapping("/{userId}/unblock")
    @PreAuthorize("hasAuthority('UNBLOCK_USER')")
    public void unblock(@PathVariable Long userId,
                        @RequestBody BlockUserRequest req) {

        Long actorId = securityUtils.getCurrentUserId();

        userService.unblockUser(userId, actorId);
    }
}