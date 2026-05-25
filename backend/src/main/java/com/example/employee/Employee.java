package com.example.employee;

import com.example.department.Department;
import com.example.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String firstName;

    private String lastName;

    private String position;

//    @ManyToOne
//    @JoinColumn(name = "department_id")
//    private Department department;
}