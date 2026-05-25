package com.example.employee;

import com.example.department.Department;
import com.example.employee.dto.EmployeeResponseDto;
import com.example.employee.dto.UpdateEmployeeRequest;
import com.example.user.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public List<EmployeeResponseDto> getAllEmployees() {

        return employeeRepository.findAllWithUsers()
                .stream()
                .map(employee -> new EmployeeResponseDto(
                        employee.getId(),
                        employee.getFirstName(),
                        employee.getLastName(),
                        employee.getPosition(),
                        employee.getUser().getEmail(),
                        employee.getUser()
                                .getDepartments()
                                .stream()
                                .map(Department::getName)
                                .collect(Collectors.joining(", "))
                ))
                .toList();
    }

    @Transactional
    public void updateEmployee(
            Long employeeId,
            UpdateEmployeeRequest request
    ) {

        Employee employee = employeeRepository
                .findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        // EMPLOYEE TABLE
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setPosition(request.getPosition());

        // USERS TABLE
        User user = employee.getUser();

        user.setEmail(request.getEmail());

        employeeRepository.save(employee);
    }
}