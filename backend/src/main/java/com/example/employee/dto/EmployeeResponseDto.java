package com.example.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EmployeeResponseDto {

    private Long id;

    private String firstName;

    private String lastName;

    private String position;

    private String email;

    private String departmentName;
}