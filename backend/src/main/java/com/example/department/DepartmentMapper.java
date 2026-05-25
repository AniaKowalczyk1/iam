package com.example.department;

import com.example.department.dto.DepartmentWithUsersDto;
import com.example.department.dto.UserDto;
import com.example.user.User;

import java.util.List;

public class DepartmentMapper {

    public static DepartmentWithUsersDto toDto(Department d) {

        return new DepartmentWithUsersDto(
                d.getId(),
                d.getName(),
                d.getUsers() == null
                        ? List.of()
                        : d.getUsers()
                        .stream()
                        .map(DepartmentMapper::toUserDto)
                        .toList()
        );
    }

    private static UserDto toUserDto(User u) {
        return new UserDto(
                u.getId(),
                u.getEmail(),
                u.isActive()
        );
    }
}