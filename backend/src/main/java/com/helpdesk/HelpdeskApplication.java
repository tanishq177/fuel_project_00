package com.helpdesk;

import com.helpdesk.model.Role;
import com.helpdesk.model.Ticket;
import com.helpdesk.model.TicketStatus;
import com.helpdesk.model.User;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDateTime;

/**
 * Main Spring Boot Application Entry Point for Customer Support & Helpdesk Platform.
 */
@SpringBootApplication
public class HelpdeskApplication {

    public static void main(String[] args) {
        SpringApplication.run(HelpdeskApplication.class, args);
        System.out.println("==========================================================");
        System.out.println(" Helpdesk Backend is RUNNING on http://localhost:8080");
        System.out.println(" API Base URL: http://localhost:8080/api");
        System.out.println("==========================================================");
    }

    /**
     * Database initializer: Automatically seeds initial demo accounts and tickets
     * if the database is currently empty.
     */
    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, TicketRepository ticketRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                System.out.println("Database is empty. Seeding initial demo accounts and tickets...");

                // 1. Create Admin
                User admin = new User("System Admin", "admin@helpdesk.com", "admin123", Role.ADMIN);
                userRepository.save(admin);

                // 2. Create Support Agents
                User agent1 = new User("Alex Turner", "agent1@helpdesk.com", "agent123", Role.SUPPORT_AGENT);
                User agent2 = new User("Sarah Connor", "agent2@helpdesk.com", "agent123", Role.SUPPORT_AGENT);
                userRepository.save(agent1);
                userRepository.save(agent2);

                // 3. Create Customers
                User customer1 = new User("John Doe", "john@customer.com", "customer123", Role.CUSTOMER);
                User customer2 = new User("Jane Smith", "jane@customer.com", "customer123", Role.CUSTOMER);
                userRepository.save(customer1);
                userRepository.save(customer2);

                // 4. Create Initial Sample Tickets
                Ticket ticket1 = new Ticket("Cannot download billing invoice", 
                        "Whenever I click the download button for invoice #1042, the page returns a 404 error.", customer1);
                ticket1.setStatus(TicketStatus.IN_PROGRESS);
                ticket1.setAssignedAgent(agent1);
                ticket1.setCreatedDate(LocalDateTime.now().minusDays(2));
                ticketRepository.save(ticket1);

                Ticket ticket2 = new Ticket("Password reset email not received", 
                        "I requested a password reset link 3 hours ago but have not received any email.", customer2);
                ticket2.setStatus(TicketStatus.OPEN);
                ticket2.setCreatedDate(LocalDateTime.now().minusHours(5));
                ticketRepository.save(ticket2);

                Ticket ticket3 = new Ticket("Feature Request: Dark Mode Support", 
                        "Please consider adding a dark mode theme for night-time dashboard usage.", customer1);
                ticket3.setStatus(TicketStatus.RESOLVED);
                ticket3.setAssignedAgent(agent2);
                ticket3.setCreatedDate(LocalDateTime.now().minusDays(5));
                ticketRepository.save(ticket3);

                System.out.println("Default demo data successfully seeded!");
            }
        };
    }
}
