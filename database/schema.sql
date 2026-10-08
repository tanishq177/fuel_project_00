-- ==========================================================
-- Database Schema: Customer Support & Helpdesk Platform
-- Database: MySQL 8.0+
-- ==========================================================

CREATE DATABASE IF NOT EXISTS helpdesk_db;
USE helpdesk_db;

-- 1. Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS responses;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS users;

-- 2. Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tickets Table
CREATE TABLE tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_date DATETIME NOT NULL,
    customer_id BIGINT NOT NULL,
    assigned_agent_id BIGINT NULL,
    CONSTRAINT fk_ticket_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ticket_agent FOREIGN KEY (assigned_agent_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Responses Table
CREATE TABLE responses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    response_date DATETIME NOT NULL,
    ticket_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_response_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_response_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_tickets_customer ON tickets(customer_id);
CREATE INDEX idx_tickets_agent ON tickets(assigned_agent_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_responses_ticket ON responses(ticket_id);
