package com.example.department;

import com.example.department.dto.DepartmentWithUsersDto;
import com.example.user.User;
import com.example.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DepartmentService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public DepartmentService(
            UserRepository userRepository,
            DepartmentRepository departmentRepository
    ) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
    }

    // moje działy
    public List<DepartmentWithUsersDto> getMyDepartments(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND));

        return user.getDepartments()
                .stream()
                .map(DepartmentMapper::toDto)
                .toList();
    }

    //  wszystkie działy z użytkownikami
    public List<DepartmentWithUsersDto> getAllDepartments() {

        return departmentRepository.findAll()
                .stream()
                .map(DepartmentMapper::toDto)
                .toList();
    }

    //  pojedynczy dział
    public DepartmentWithUsersDto getDepartmentById(Long id) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND));

        return DepartmentMapper.toDto(department);
    }


}