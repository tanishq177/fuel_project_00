package com.helpdesk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for posting a response/message to a ticket thread.
 */
public class ResponseRequest {

    @NotBlank(message = "Response message cannot be empty")
    private String message;

    @NotNull(message = "User ID is required")
    private Long userId;

    public ResponseRequest() {
    }

    public ResponseRequest(String message, Long userId) {
        this.message = message;
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
