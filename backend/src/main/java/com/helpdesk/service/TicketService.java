package com.helpdesk.service;

import com.helpdesk.dto.TicketRequest;
import com.helpdesk.model.Role;
import com.helpdesk.model.Ticket;
import com.helpdesk.model.TicketStatus;
import com.helpdesk.model.User;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service class handling Ticket lifecycle and business operations.
 */
@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Autowired
    public TicketService(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new support ticket raised by a customer.
     */
    public Ticket createTicket(TicketRequest request) {
        // Fetch customer
        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + request.getCustomerId()));

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedDate(LocalDateTime.now());
        ticket.setCustomer(customer);
        ticket.setAssignedAgent(null); // Initially unassigned

        return ticketRepository.save(ticket);
    }

    /**
     * Retrieve a ticket by ID.
     */
    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with ID: " + id));
    }

    /**
     * Retrieve all tickets (Admin view).
     */
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedDateDesc();
    }

    /**
     * Retrieve tickets for a specific customer.
     */
    public List<Ticket> getTicketsByCustomer(Long customerId) {
        return ticketRepository.findByCustomerIdOrderByCreatedDateDesc(customerId);
    }

    /**
     * Retrieve tickets assigned to a specific support agent.
     */
    public List<Ticket> getTicketsByAgent(Long agentId) {
        return ticketRepository.findByAssignedAgentIdOrderByCreatedDateDesc(agentId);
    }

    /**
     * Update status of an existing ticket (e.g. OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED).
     */
    public Ticket updateTicketStatus(Long ticketId, TicketStatus newStatus) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setStatus(newStatus);
        return ticketRepository.save(ticket);
    }

    /**
     * Assign a ticket to a support agent (Admin action).
     * If ticket was OPEN, auto-transition to IN_PROGRESS upon agent assignment.
     */
    public Ticket assignTicketToAgent(Long ticketId, Long agentId) {
        Ticket ticket = getTicketById(ticketId);
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Support Agent not found with ID: " + agentId));

        if (agent.getRole() != Role.SUPPORT_AGENT && agent.getRole() != Role.ADMIN) {
            throw new RuntimeException("User with ID " + agentId + " is not a Support Agent.");
        }

        ticket.setAssignedAgent(agent);
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        return ticketRepository.save(ticket);
    }
}
