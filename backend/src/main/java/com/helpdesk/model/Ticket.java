package com.helpdesk.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing a Customer Support Ticket.
 */
@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketStatus status = TicketStatus.OPEN;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    // The customer who raised the ticket
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    // The support agent assigned to resolve the ticket (can be null initially)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_agent_id", nullable = true)
    private User assignedAgent;

    // Default constructor for JPA
    public Ticket() {
    }

    // Parameterized constructor
    public Ticket(String title, String description, User customer) {
        this.title = title;
        this.description = description;
        this.customer = customer;
        this.status = TicketStatus.OPEN;
        this.createdDate = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdDate == null) {
            this.createdDate = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = TicketStatus.OPEN;
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }

    public User getAssignedAgent() {
        return assignedAgent;
    }

    public void setAssignedAgent(User assignedAgent) {
        this.assignedAgent = assignedAgent;
    }
}
