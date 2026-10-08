package com.helpdesk.repository;

import com.helpdesk.model.Ticket;
import com.helpdesk.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA Repository for Ticket entity operations.
 */
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Find all tickets created by a specific customer, ordered by newest first
    List<Ticket> findByCustomerIdOrderByCreatedDateDesc(Long customerId);

    // Find all tickets assigned to a specific support agent, ordered by newest first
    List<Ticket> findByAssignedAgentIdOrderByCreatedDateDesc(Long agentId);

    // Find tickets by status
    List<Ticket> findByStatusOrderByCreatedDateDesc(TicketStatus status);

    // Find all tickets ordered by newest first
    List<Ticket> findAllByOrderByCreatedDateDesc();
}
