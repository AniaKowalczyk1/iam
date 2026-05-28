package com.example.task;

import com.example.audit.AuditLog;
import com.example.audit.AuditLogRepository;
import com.example.security.SecurityUtils;
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
    private final AuditLogRepository auditRepo;
    private final SecurityUtils securityUtils;

    public TaskService(TaskRepository taskRepository,
                       UserRepository userRepository,
                       DepartmentRepository departmentRepository,
                       AuditLogRepository auditRepo,
                       SecurityUtils securityUtils) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.auditRepo = auditRepo;
        this.securityUtils = securityUtils;
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

        Task savedTask = taskRepository.save(task);

        // =========================
        // AUDIT LOG
        // =========================
        AuditLog log = new AuditLog();

        log.setUserId(securityUtils.getCurrentUserId());
        log.setAction("TASK_CREATED");
        log.setDetails(
                "Dodano zadanie: "
                        + savedTask.getTitle()
                        + " w dziale: "
                        + savedTask.getDepartment().getName()
        );

        auditRepo.save(log);

        return savedTask;
    }

    public void deleteTask(Long taskId) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        String taskTitle = task.getTitle();
        String departmentName = task.getDepartment() != null
                ? task.getDepartment().getName()
                : "brak działu";

        taskRepository.delete(task);

        // =========================
        // AUDIT LOG
        // =========================
        AuditLog log = new AuditLog();

        log.setUserId(securityUtils.getCurrentUserId());
        log.setAction("TASK_DELETED");
        log.setDetails(
                "Usunięto zadanie: "
                        + taskTitle
                        + " z działu: "
                        + departmentName
        );

        auditRepo.save(log);
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

        Set<User> assignedUsers = new HashSet<>();
        Set<User> unassignedUsers = new HashSet<>();

        for (User user : users) {

            if (currentIds.contains(user.getId())) {

                currentAssignees.removeIf(u -> u.getId().equals(user.getId()));
                unassignedUsers.add(user);

            } else {

                currentAssignees.add(user);
                assignedUsers.add(user);
            }
        }

        task.setUpdatedAt(LocalDateTime.now());

        Task savedTask = taskRepository.save(task);

        // =========================
        // AUDIT LOG - ASSIGNED
        // =========================
        for (User user : assignedUsers) {

            AuditLog log = new AuditLog();

            log.setUserId(securityUtils.getCurrentUserId());
            log.setAction("TASK_USER_ASSIGNED");
            log.setDetails(
                    "Przypisano użytkownika "
                            + user.getEmail()
                            + " do zadania: "
                            + savedTask.getTitle()
            );

            auditRepo.save(log);
        }

        // =========================
        // AUDIT LOG - UNASSIGNED
        // =========================
        for (User user : unassignedUsers) {

            AuditLog log = new AuditLog();

            log.setUserId(securityUtils.getCurrentUserId());
            log.setAction("TASK_USER_UNASSIGNED");
            log.setDetails(
                    "Usunięto przypisanie użytkownika "
                            + user.getEmail()
                            + " z zadania: "
                            + savedTask.getTitle()
            );

            auditRepo.save(log);
        }

        return savedTask;
    }

    public Task changeStatus(Long taskId, ChangeTaskStatusRequest request) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        String newStatus = request.getStatus();

        if (newStatus == null || newStatus.isBlank()) {
            throw new RuntimeException("Status cannot be empty");
        }

        String oldStatus = task.getStatus();

        task.setStatus(newStatus);
        task.setUpdatedAt(LocalDateTime.now());

        Task savedTask = taskRepository.save(task);

        // =========================
        // AUDIT LOG
        // =========================
        AuditLog log = new AuditLog();

        log.setUserId(securityUtils.getCurrentUserId());
        log.setAction("TASK_STATUS_CHANGED");
        log.setDetails(
                "Zmieniono status zadania: "
                        + savedTask.getTitle()
                        + " z "
                        + oldStatus
                        + " na "
                        + savedTask.getStatus()
        );

        auditRepo.save(log);

        return savedTask;
    }
}