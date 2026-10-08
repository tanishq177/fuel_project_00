package com.helpdesk.controller;

import com.helpdesk.dto.ResponseRequest;
import com.helpdesk.model.Response;
import com.helpdesk.service.ResponseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller handling response messages in ticket conversation threads.
 */
@RestController
@RequestMapping("/api/tickets/{ticketId}/responses")
public class ResponseController {

    private final ResponseService responseService;

    @Autowired
    public ResponseController(ResponseService responseService) {
        this.responseService = responseService;
    }

    /**
     * Post a new response to a ticket thread.
     * POST /api/tickets/{ticketId}/responses
     */
    @PostMapping
    public ResponseEntity<?> addResponse(
            @PathVariable Long ticketId,
            @Valid @RequestBody ResponseRequest request) {
        try {
            Response response = responseService.addResponse(ticketId, request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage() != null ? ex.getMessage() : "Failed to post response.");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get all responses for a ticket.
     * GET /api/tickets/{ticketId}/responses
     */
    @GetMapping
    public ResponseEntity<?> getResponses(@PathVariable Long ticketId) {
        try {
            List<Response> responses = responseService.getResponsesByTicketId(ticketId);
            return ResponseEntity.ok(responses);
        } catch (Exception ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage() != null ? ex.getMessage() : "Responses not found.");
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }
    }
}
