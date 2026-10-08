package com.helpdesk.service;

import com.helpdesk.dto.AuthResponse;
import com.helpdesk.dto.LoginRequest;
import com.helpdesk.dto.RegisterRequest;
import com.helpdesk.model.Role;
import com.helpdesk.model.User;
import com.helpdesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service class handling user business logic: registration, login, and user management.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Register a new user (Default role: CUSTOMER).
     */
    public AuthResponse register(RegisterRequest request) {
        // 1. Check if email already registered
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new RuntimeException("Email is already registered. Please login instead.");
        }

        // 2. Create and populate new User entity
        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(request.getPassword()); // Stored simply for college project viva
        user.setRole(request.getRole() != null ? request.getRole() : Role.CUSTOMER);

        // 3. Save to database
        User savedUser = userRepository.save(user);

        return new AuthResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                "Registration successful! Welcome to the Customer Helpdesk."
        );
    }

    /**
     * Authenticate user with email and password.
     */
    public AuthResponse login(LoginRequest request) {
        // 1. Find user by email
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));

        // 2. Verify password
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid email or password.");
        }

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                "Login successful! Welcome back."
        );
    }

    /**
     * Get user by ID.
     */
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
    }

    /**
     * Get all users in the system.
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get all users with a specific role (e.g., SUPPORT_AGENT).
     */
    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }
}
