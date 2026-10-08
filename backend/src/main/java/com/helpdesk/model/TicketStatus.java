package com.helpdesk.model;

/**
 * Lifecycle states of a Support Ticket:
 * - OPEN: Newly created ticket awaiting action.
 * - IN_PROGRESS: Agent assigned or currently working on the ticket.
 * - RESOLVED: Solution provided to the customer.
 * - CLOSED: Completed and verified issue.
 */
public enum TicketStatus {
    OPEN,
    IN_PROGRESS,
    RESOLVED,
    CLOSED
}
