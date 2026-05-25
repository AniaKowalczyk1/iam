package com.example.task;

import com.example.department.DepartmentRepository;
import com.example.user.User;
import com.example.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public TaskService(TaskRepository taskRepository,
                       UserRepository userRepository,
                       DepartmentRepository departmentRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
    }

    private boolean hasAuthority(String authority) {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals(authority));
    }

    public List<Task> getOwnTasks() {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        return taskRepository.findByAssigneesContaining(user);
    }

    public List<Task> getDepartmentTasks() {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        return taskRepository.findByDepartmentIn(
                user.getDepartments().stream().toList()
        );
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task createTask(CreateTaskRequest req) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User creator = userRepository.findByEmail(email)
                .orElseThrow();

        Task task = new Task();

        task.setTitle(req.getTitle());
        task.setDescription(req.getDescription());

        task.setStatus(
                req.getStatus() != null ? req.getStatus() : "PENDING"
        );

        task.setCreatedBy(creator);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        task.setDepartment(
                departmentRepository.findById(req.getDepartmentId())
                        .orElseThrow(() -> new RuntimeException("Department not found"))
        );
        // =========================
        // ASSIGNEES
        // =========================
        if (req.getAssigneeIds() != null) {
            Set<User> users = req.getAssigneeIds().stream()
                    .map(id -> userRepository.findById(id)
                            .orElseThrow())
                    .collect(Collectors.toSet());

            task.setAssignees(users);
        }

        return taskRepository.save(task);
    }

    public void deleteTask(Long taskId) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        taskRepository.delete(task);
    }

    public Task assignUsers(Long taskId, AssignTaskRequest request) {

        if (request.getUserIds() == null || request.getUserIds().isEmpty()) {
            throw new RuntimeException("userIds cannot be null or empty");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Set<Long> incomingIds = new HashSet<>(request.getUserIds());

        Set<User> currentAssignees = task.getAssignees();


        Set<Long> currentIds = currentAssignees.stream()
                .map(User::getId)
                .collect(Collectors.toSet());


        Set<User> users = incomingIds.stream()
                .map(id -> userRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("User not found: " + id)))
                .collect(Collectors.toSet());

        for (User user : users) {

            if (currentIds.contains(user.getId())) {

                currentAssignees.removeIf(u -> u.getId().equals(user.getId()));
            } else {

                currentAssignees.add(user);
            }
        }

        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    public Task changeStatus(Long taskId, ChangeTaskStatusRequest request) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        String newStatus = request.getStatus();


        if (newStatus == null || newStatus.isBlank()) {
            throw new RuntimeException("Status cannot be empty");
        }

        task.setStatus(newStatus);
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }
}