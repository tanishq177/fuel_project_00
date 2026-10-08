package com.helpdesk.repository;

import com.helpdesk.model.Role;
import com.helpdesk.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for User entity operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by email for authentication
    Optional<User> findByEmail(String email);

    // Check if email already exists during registration
    boolean existsByEmail(String email);

    // Find all users with a specific role (e.g. all SUPPORT_AGENTs)
    List<User> findByRole(Role role);
}
