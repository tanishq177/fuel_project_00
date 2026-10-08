package com.helpdesk.model;

/**
 * User roles available in the Helpdesk platform:
 * - CUSTOMER: Can create and view their own tickets.
 * - SUPPORT_AGENT: Can view assigned tickets and reply/update status.
 * - ADMIN: Can manage users and assign tickets to agents.
 */
public enum Role {
    CUSTOMER,
    SUPPORT_AGENT,
    ADMIN
}
