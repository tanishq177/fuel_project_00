-- ==========================================================
-- Sample Seed Data: Customer Support & Helpdesk Platform
-- Use this file to populate demo accounts and initial tickets.
-- ==========================================================

USE helpdesk_db;

-- 1. Insert Users (Admin, Support Agents, Customers)
-- Note: In this simple college project, passwords can be stored as plain text or standard hash for simplicity.
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'System Admin', 'admin@helpdesk.com', 'admin123', 'ADMIN'),
(2, 'Alex Turner (Agent)', 'agent1@helpdesk.com', 'agent123', 'SUPPORT_AGENT'),
(3, 'Sarah Connor (Agent)', 'agent2@helpdesk.com', 'agent123', 'SUPPORT_AGENT'),
(4, 'John Doe (Customer)', 'john@customer.com', 'customer123', 'CUSTOMER'),
(5, 'Jane Smith (Customer)', 'jane@customer.com', 'customer123', 'CUSTOMER');

-- 2. Insert Sample Tickets
INSERT INTO tickets (id, title, description, status, created_date, customer_id, assigned_agent_id) VALUES
(1, 'Cannot access billing invoice PDF', 'Whenever I click the download button for invoice #1042, the page returns a 404 error.', 'IN_PROGRESS', '2026-10-01 10:15:00', 4, 2),
(2, 'Password reset email not received', 'I tried resetting my password multiple times today but no email arrived in my inbox or spam folder.', 'OPEN', '2026-10-02 14:30:00', 5, NULL),
(3, 'Feature request: Dark mode toggle', 'Would love to see a dark mode option added to the customer dashboard for late night usage.', 'RESOLVED', '2026-09-28 09:00:00', 4, 3),
(4, 'Slow dashboard loading speed', 'The dashboard takes more than 15 seconds to load data when logging in.', 'OPEN', '2026-10-05 11:20:00', 5, 2);

-- 3. Insert Sample Responses
INSERT INTO responses (id, message, response_date, ticket_id, user_id) VALUES
(1, 'Hello John, we have identified the missing PDF link on the server. Our engineering team is generating a fresh copy.', '2026-10-01 11:00:00', 1, 2),
(2, 'Thank you Alex! Please let me know once ready.', '2026-10-01 11:15:00', 1, 4),
(3, 'Hi John, the dark mode feature has been successfully deployed in version 2.4. Enjoy!', '2026-09-29 16:45:00', 3, 3),
(4, 'Awesome, works great now! Thanks Sarah.', '2026-09-29 17:00:00', 3, 4);
