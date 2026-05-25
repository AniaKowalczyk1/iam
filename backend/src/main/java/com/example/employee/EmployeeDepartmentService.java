//package com.example.employee;
//
//import com.example.department.Department;
//import com.example.department.DepartmentRepository;
//import org.springframework.http.HttpStatus;
//import org.springframework.stereotype.Service;
//import org.springframework.web.server.ResponseStatusException;
//
//@Service
//public class EmployeeDepartmentService {
//
//    private final EmployeeRepository employeeRepository;
//    private final DepartmentRepository departmentRepository;
//
//    public EmployeeDepartmentService(
//            EmployeeRepository employeeRepository,
//            DepartmentRepository departmentRepository
//    ) {
//        this.employeeRepository = employeeRepository;
//        this.departmentRepository = departmentRepository;
//    }
//
//    public void assign(Long employeeId, Long departmentId) {
//
//        Employee employee = employeeRepository.findById(employeeId)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
//
//        Department department = departmentRepository.findById(departmentId)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
//
//        employee.getDepartments().add(department);
//        employeeRepository.save(employee);
//    }
//
//    public void remove(Long employeeId, Long departmentId) {
//
//        Employee employee = employeeRepository.findById(employeeId)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
//
//        employee.getDepartments()
//                .removeIf(d -> d.getId().equals(departmentId));
//
//        employeeRepository.save(employee);
//    }
//}