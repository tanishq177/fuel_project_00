package com.helpdesk.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing a Response/Message in a Ticket conversation thread.
 */
@Entity
@Table(name = "responses")
public class Response {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "response_date", nullable = false)
    private LocalDateTime responseDate;

    // The ticket this response belongs to
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    // The user who wrote the message (Agent, Customer, or Admin)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Default constructor for JPA
    public Response() {
    }

    // Parameterized constructor
    public Response(String message, Ticket ticket, User user) {
        this.message = message;
        this.ticket = ticket;
        this.user = user;
        this.responseDate = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.responseDate == null) {
            this.responseDate = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getResponseDate() {
        return responseDate;
    }

    public void setResponseDate(LocalDateTime responseDate) {
        this.responseDate = responseDate;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
