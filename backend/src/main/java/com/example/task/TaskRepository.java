package com.example.task;

import com.example.user.User;
import com.example.department.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByAssigneesContaining(User user);

    List<Task> findByDepartmentIn(List<Department> departments);
}