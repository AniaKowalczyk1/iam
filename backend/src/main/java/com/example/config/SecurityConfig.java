package com.example.config;

import com.example.security.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        return http
                .csrf(csrf -> csrf.disable())
                .cors(org.springframework.security.config.Customizer.withDefaults())
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/auth/**").permitAll()

                        .requestMatchers("/audit/**")
                        .hasAuthority("VIEW_AUDIT_LOGS")

                        // USERS

                        .requestMatchers(HttpMethod.GET, "/admin/users/**")
                        .hasAuthority("VIEW_USERS")

                        .requestMatchers(HttpMethod.POST, "/admin/users")
                        .hasAuthority("CREATE_USER")

                        .requestMatchers(HttpMethod.POST, "/admin/users/*/block")
                        .hasAuthority("BLOCK_USER")

                        .requestMatchers(HttpMethod.POST, "/admin/users/*/unblock")
                        .hasAuthority("UNBLOCK_USER")

                        .requestMatchers(HttpMethod.DELETE, "/admin/users/*")
                        .hasAuthority("DELETE_USER")

//                        .requestMatchers("/tasks/**")
//                        .hasAuthority("VIEW_TASK")

                        // departments
                        .requestMatchers("/departments/view")
                        .hasAuthority("VIEW_DEPARTMENT")

                        .requestMatchers(HttpMethod.POST, "/departments/assign")
                        .hasAuthority("ASSIGN_REMOVE_USER_TO_FROM_DEPARTMENT")

                        .requestMatchers(HttpMethod.DELETE, "/departments/remove")
                        .hasAuthority("ASSIGN_REMOVE_USER_TO_FROM_DEPARTMENT")

                        .requestMatchers(HttpMethod.DELETE, "/departments/remove-all")
                        .hasAuthority("ASSIGN_REMOVE_USER_TO_FROM_DEPARTMENT")

                        .requestMatchers(HttpMethod.POST, "/departments")
                        .hasAuthority("CREATE_DEPARTMENT")

                        .requestMatchers(HttpMethod.GET, "/departments/**")
                        .hasAuthority("VIEW_DEPARTMENTS")




                        .requestMatchers(HttpMethod.GET, "/tasks/own")
                        .hasAuthority("VIEW_OWN_TASKS")

                        .requestMatchers(HttpMethod.GET, "/tasks/department")
                        .hasAuthority("VIEW_DEPARTMENT_TASKS")

                        .requestMatchers(HttpMethod.GET, "/tasks/all")
                        .hasAuthority("VIEW_ALL_TASKS")

                        .requestMatchers(HttpMethod.POST, "/tasks")
                        .hasAuthority("CREATE_TASK")

                        .requestMatchers(HttpMethod.PATCH, "/tasks/*/assign")
                        .hasAuthority("ASSIGN_TASK")

                        .requestMatchers(HttpMethod.PATCH, "/tasks/*/status")
                        .hasAuthority("CHANGE_TASK_STATUS")

                        .requestMatchers(HttpMethod.DELETE, "/tasks/**")
                        .hasAuthority("DELETE_TASK")


                        .requestMatchers(HttpMethod.POST,
                                "/admin/users/*/permissions")
                        .hasAuthority("GRANT_PERMISSION_TO_USER")

                        .requestMatchers(HttpMethod.DELETE,
                                "/admin/users/*/permissions/*")
                        .hasAuthority("REVOKE_PERMISSION_FROM_USER")

                        .requestMatchers(HttpMethod.GET, "/employees/**")
                        .hasAuthority("VIEW_EMPLOYEES")

                        .requestMatchers(HttpMethod.PUT, "/employees/**")
                        .hasAuthority("UPDATE_EMPLOYEE")

                        .requestMatchers(HttpMethod.PUT, "/users/*/reset-password")
                        .hasAuthority("RESET_PASSWORD")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}