package com.helpdesk.controller;

import com.helpdesk.model.Role;
import com.helpdesk.model.Ticket;
import com.helpdesk.model.User;
import com.helpdesk.service.TicketService;
import com.helpdesk.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller handling Admin specific operations:
 * - Viewing all users & filtering agents
 * - Viewing all tickets
 * - Assigning tickets to support agents
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final TicketService ticketService;

    @Autowired
    public AdminController(UserService userService, TicketService ticketService) {
        this.userService = userService;
        this.ticketService = ticketService;
    }

    /**
     * Get all users or filter by role (e.g. ?role=SUPPORT_AGENT).
     * GET /api/admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers(@RequestParam(required = false) Role role) {
        if (role != null) {
            return ResponseEntity.ok(userService.getUsersByRole(role));
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * Get all tickets in the system.
     * GET /api/admin/tickets
     */
    @GetMapping("/tickets")
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    /**
     * Assign a ticket to a support agent.
     * PUT /api/admin/tickets/{ticketId}/assign/{agentId}
     */
    @PutMapping("/tickets/{ticketId}/assign/{agentId}")
    public ResponseEntity<?> assignTicket(
            @PathVariable Long ticketId,
            @PathVariable Long agentId) {
        try {
            Ticket updatedTicket = ticketService.assignTicketToAgent(ticketId, agentId);
            return ResponseEntity.ok(updatedTicket);
        } catch (Exception ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage() != null ? ex.getMessage() : "Failed to assign agent.");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }
}
