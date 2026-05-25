package com.example.permission;

import com.example.user.User;
import com.example.user.UserRepository;
import com.example.user.dto.GrantPermissionRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserPermissionService {

    private final UserRepository userRepo;
    private final PermissionRepository permissionRepo;
    private final UserPermissionRepository userPermissionRepo;

    public UserPermissionService(
            UserRepository userRepository,
            PermissionRepository permissionRepository,
            UserPermissionRepository userPermissionRepository
    ) {
        this.userRepo = userRepository;
        this.permissionRepo = permissionRepository;
        this.userPermissionRepo = userPermissionRepository;
    }

    @Transactional
    public void grantPermissionToUser(
            Long targetUserId,
            GrantPermissionRequest req,
            Long actorId
    ) {

        User user = userRepo.findById(targetUserId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Permission permission =
                permissionRepo.findById(req.getPermissionId())
                        .orElseThrow(() ->
                                new RuntimeException("Permission not found"));

        // CHECK EXISTING OVERRIDE
        Optional<UserPermission> existing =
                userPermissionRepo
                        .findByUser_IdAndPermission_Id(
                                targetUserId,
                                req.getPermissionId()
                        );

        UserPermission up;

        if (existing.isPresent()) {

            up = existing.get();

        } else {

            up = new UserPermission();

            up.setUser(user);
            up.setPermission(permission);
        }

        up.setEffect(req.getEffect());
        up.setReason(req.getReason());
        up.setGrantedBy(actorId);
        //up.setExpiresAt(req.getExpiresAt());

        userPermissionRepo.save(up);
    }

    @Transactional
    public void revokePermissionFromUser(
            Long targetUserId,
            Long permissionId
    ) {

        UserPermission up =
                userPermissionRepo
                        .findByUser_IdAndPermission_Id(
                                targetUserId,
                                permissionId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Permission override not found"
                                ));

        userPermissionRepo.delete(up);
    }

    @Transactional(readOnly = true)
    public List<UserPermission> getUserPermissions(Long userId) {

        return userPermissionRepo.findByUserId(userId);
    }
}