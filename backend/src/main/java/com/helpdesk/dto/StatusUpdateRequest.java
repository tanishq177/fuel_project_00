package com.helpdesk.dto;

import com.helpdesk.model.TicketStatus;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for updating the status of an existing ticket.
 */
public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    public StatusUpdateRequest() {
    }

    public StatusUpdateRequest(TicketStatus status) {
        this.status = status;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }
}
