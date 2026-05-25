package com.example.task;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // =========================
    // OWN TASKS
    // =========================
    @GetMapping("/own")
    @PreAuthorize("hasAuthority('VIEW_OWN_TASKS')")
    public List<Task> getOwnTasks() {
        return taskService.getOwnTasks();
    }

    // =========================
    // DEPARTMENT TASKS
    // =========================
    @GetMapping("/department")
    @PreAuthorize("hasAuthority('VIEW_DEPARTMENT_TASKS')")
    public List<Task> getDepartmentTasks() {
        return taskService.getDepartmentTasks();
    }

    // =========================
    // ALL TASKS (ADMIN / MANAGER)
    // =========================
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('VIEW_ALL_TASKS')")
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    // =========================
    // CREATE TASK
    // =========================
    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_TASK')")
    public Task createTask(@RequestBody CreateTaskRequest req) {
        return taskService.createTask(req);
    }


    // =========================
    // DELETE TASK
    // =========================
    @DeleteMapping("/{taskId}")
    @PreAuthorize("hasAuthority('DELETE_TASK')")
    public void deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
    }

    // =========================
    // ASSIGN TASK
    // =========================
    @PutMapping("/{taskId}/assign")
    @PreAuthorize("hasAuthority('ASSIGN_TASK')")
    public Task assignUsers(
            @PathVariable Long taskId,
            @RequestBody AssignTaskRequest request
    ) {
        return taskService.assignUsers(taskId, request);
    }

    // =========================
    // CHANGE TASK STATUS
    // =========================
    @PatchMapping("/{taskId}/status")
    @PreAuthorize("hasAuthority('CHANGE_TASK_STATUS')")
    public Task changeStatus(
            @PathVariable Long taskId,
            @RequestBody ChangeTaskStatusRequest request
    ) {
        return taskService.changeStatus(taskId, request);
    }
}