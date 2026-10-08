package com.helpdesk.repository;

import com.helpdesk.model.Response;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA Repository for Response entity operations.
 */
@Repository
public interface ResponseRepository extends JpaRepository<Response, Long> {

    // Find all responses for a specific ticket ordered chronologically (oldest to newest)
    List<Response> findByTicketIdOrderByResponseDateAsc(Long ticketId);
}
