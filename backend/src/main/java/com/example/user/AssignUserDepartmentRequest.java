package com.example.user;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignUserDepartmentRequest {
    private Long userId;
    private Long departmentId;
}