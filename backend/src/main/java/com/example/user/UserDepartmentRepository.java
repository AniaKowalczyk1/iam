package com.example.user;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface UserDepartmentRepository
        extends JpaRepository<UserDepartment, UserDepartmentId> {

    boolean existsByUser_IdAndDepartment_Id(Long userId, Long departmentId);
    @Modifying
    @Transactional
    @Query("DELETE FROM UserDepartment ud WHERE ud.department.id = :departmentId")
    void deleteAllByDepartmentId(Long departmentId);
}