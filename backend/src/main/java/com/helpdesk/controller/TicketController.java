package com.helpdesk.controller;

import com.helpdesk.dto.StatusUpdateRequest;
import com.helpdesk.dto.TicketRequest;
import com.helpdesk.model.Ticket;
import com.helpdesk.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller handling Ticket creation, retrieval, and status updates.
 */
@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    @Autowired
    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    /**
     * Create a new ticket (Customer).
     * POST /api/tickets
     */
    @PostMapping
    public ResponseEntity<?> createTicket(@Valid @RequestBody TicketRequest request) {
        try {
            Ticket ticket = ticketService.createTicket(request);
            return new ResponseEntity<>(ticket, HttpStatus.CREATED);
        } catch (Exception ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage() != null ? ex.getMessage() : "Failed to create ticket.");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Retrieve tickets with optional filtering:
     * - ?customerId=X -> Customer's tickets
     * - ?agentId=Y -> Agent's assigned tickets
     * - No params -> All tickets
     * GET /api/tickets
     */
    @GetMapping
    public ResponseEntity<List<Ticket>> getTickets(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long agentId) {

        if (customerId != null) {
            return ResponseEntity.ok(ticketService.getTicketsByCustomer(customerId));
        } else if (agentId != null) {
            return ResponseEntity.ok(ticketService.getTicketsByAgent(agentId));
        } else {
            return ResponseEntity.ok(ticketService.getAllTickets());
        }
    }

    /**
     * Retrieve single ticket details by ID.
     * GET /api/tickets/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable Long id) {
        try {
            Ticket ticket = ticketService.getTicketById(id);
            return ResponseEntity.ok(ticket);
        } catch (Exception ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage() != null ? ex.getMessage() : "Ticket not found.");
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Update ticket status (OPEN, IN_PROGRESS, RESOLVED, CLOSED).
     * PUT /api/tickets/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        try {
            Ticket updatedTicket = ticketService.updateTicketStatus(id, request.getStatus());
            return ResponseEntity.ok(updatedTicket);
        } catch (Exception ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage() != null ? ex.getMessage() : "Failed to update ticket status.");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }
}
