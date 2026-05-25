package com.example.user;

import com.example.department.Department;
import com.example.department.DepartmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserDepartmentService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final UserDepartmentRepository userDepartmentRepository;

    public UserDepartmentService(
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            UserDepartmentRepository userDepartmentRepository
    ) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.userDepartmentRepository = userDepartmentRepository;
    }

    public void assignUserToDepartment(Long userId, Long departmentId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND));

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (userDepartmentRepository.existsByUser_IdAndDepartment_Id(userId, departmentId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "User already assigned to this department"
            );
        }

        UserDepartment ud = new UserDepartment();
        ud.setId(new UserDepartmentId(userId, departmentId));
        ud.setUser(user);
        ud.setDepartment(department);

        userDepartmentRepository.save(ud);
    }

    public void removeUserFromDepartment(Long userId, Long departmentId) {

        UserDepartmentId id = new UserDepartmentId(userId, departmentId);

        if (!userDepartmentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        userDepartmentRepository.deleteById(id);
    }

    public void removeAllUsersFromDepartment(Long departmentId) {
        userDepartmentRepository.deleteAllByDepartmentId(departmentId);
    }
}