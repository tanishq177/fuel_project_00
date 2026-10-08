package com.helpdesk.service;

import com.helpdesk.dto.ResponseRequest;
import com.helpdesk.model.Response;
import com.helpdesk.model.Ticket;
import com.helpdesk.model.User;
import com.helpdesk.repository.ResponseRepository;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service class handling Ticket conversation thread and responses.
 */
@Service
public class ResponseService {

    private final ResponseRepository responseRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Autowired
    public ResponseService(ResponseRepository responseRepository,
                           TicketRepository ticketRepository,
                           UserRepository userRepository) {
        this.responseRepository = responseRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    /**
     * Add a new response/message to a ticket conversation.
     */
    public Response addResponse(Long ticketId, ResponseRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with ID: " + ticketId));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getUserId()));

        Response response = new Response();
        response.setMessage(request.getMessage().trim());
        response.setResponseDate(LocalDateTime.now());
        response.setTicket(ticket);
        response.setUser(user);

        return responseRepository.save(response);
    }

    /**
     * Get all responses for a given ticket in chronological order.
     */
    public List<Response> getResponsesByTicketId(Long ticketId) {
        // Validate ticket exists
        if (!ticketRepository.existsById(ticketId)) {
            throw new RuntimeException("Ticket not found with ID: " + ticketId);
        }
        return responseRepository.findByTicketIdOrderByResponseDateAsc(ticketId);
    }
}
