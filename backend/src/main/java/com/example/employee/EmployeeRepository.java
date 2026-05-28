package com.example.employee;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @Query("""
        SELECT e
        FROM Employee e
        JOIN FETCH e.user
    """)
    List<Employee> findAllWithUsers();

    @Query("""
        SELECT e
        FROM Employee e
        JOIN FETCH e.user
        WHERE e.user.email = :email
    """)
    Optional<Employee> findByUserEmail(@Param("email") String email);
}