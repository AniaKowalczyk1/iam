package com.example.department;

import com.example.department.dto.DepartmentWithUsersDto;
import com.example.user.UserDepartmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departments")
public class DepartmentController {

    private final DepartmentRepository repo;
    private final UserDepartmentService userDepartmentService;
    private final DepartmentService departmentService;

    public DepartmentController(
            DepartmentRepository repo,
            UserDepartmentService userDepartmentService,
            DepartmentService departmentService
    ) {
        this.repo = repo;
        this.userDepartmentService = userDepartmentService;
        this.departmentService = departmentService;
    }

    // wszystkie działy z użytkownikami
    @GetMapping
    public List<DepartmentWithUsersDto> getAll() {
        return departmentService.getAllDepartments();
    }

    // moje działy
    @GetMapping("/view")
    public List<DepartmentWithUsersDto> myDepartments(
            @AuthenticationPrincipal String email
    ) {
        return departmentService.getMyDepartments(email);
    }

    // pojedynczy dział z użytkownikami
    @GetMapping("/{id}")
    public DepartmentWithUsersDto getById(@PathVariable Long id) {
        return departmentService.getDepartmentById(id);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Department d) {
        return ResponseEntity.ok(
                departmentService.createDepartment(d)
        );
    }

    @PostMapping("/assign")
    public void assign(
            @RequestParam Long userId,
            @RequestParam Long departmentId
    ) {
        userDepartmentService.assignUserToDepartment(userId, departmentId);
    }

    @DeleteMapping("/remove")
    public void remove(
            @RequestParam Long userId,
            @RequestParam Long departmentId
    ) {
        userDepartmentService.removeUserFromDepartment(userId, departmentId);
    }

    @DeleteMapping("/remove-all")
    public void removeAll(@RequestParam Long departmentId) {
        userDepartmentService.removeAllUsersFromDepartment(departmentId);
    }
}