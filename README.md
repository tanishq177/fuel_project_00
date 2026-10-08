# Customer Support & Helpdesk Platform

A complete, production-ready **Java Full Stack Web Application** designed for a 5-member college project team. This platform enables customers to submit and track support tickets, support agents to resolve customer issues via conversational threads, and administrators to oversee all users and assign tickets.

---

## 📋 Table of Contents

1. [Problem Statement & Objective](#-problem-statement--objective)
2. [Key Features by Role](#-key-features-by-role)
3. [Technology Stack](#-technology-stack)
4. [System Architecture & Data Flow](#-system-architecture--data-flow)
5. [Database Design & Schema](#-database-design--schema)
6. [REST API Documentation](#-rest-api-documentation)
7. [Pre-Seeded Demo Accounts for Viva](#-pre-seeded-demo-accounts-for-viva)
8. [Installation & Setup Guide](#-installation--setup-guide)
   - [Step 1: MySQL Database Setup](#step-1-mysql-database-setup)
   - [Step 2: Backend Setup & Run](#step-2-backend-setup--run)
   - [Step 3: Frontend Setup & Run](#step-3-frontend-setup--run)
9. [GitHub 5-Member Team Collaboration Guide](#-github-5-member-team-collaboration-guide)
10. [Viva Preparation & Concept Q&A](#-viva-preparation--concept-qa)

---

## 🎯 Problem Statement & Objective

### Problem Statement
In modern web applications, businesses receive numerous customer queries regarding technical glitches, billing errors, and account management. Managing customer queries through scattered emails or direct messages leads to delayed response times, lost tickets, and poor customer satisfaction.

### Objective
To develop a centralized, role-based **Customer Support & Helpdesk System** that:
- Streamlines customer ticket submission and tracking.
- Provides support agents with dedicated workspaces to manage and resolve assigned issues.
- Enables system administrators to monitor ticket lifecycles and assign workload dynamically.

---

## 👥 Key Features by Role

### 1. 🛍️ Customer
- **Registration & Authentication**: Simple registration and secure login.
- **Ticket Creation**: Submit support requests with a descriptive title and detailed explanation.
- **Ticket Tracking**: View personal tickets categorized by status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`).
- **Conversational Thread**: Communicate directly with the assigned agent on the ticket details page.

### 2. 🎧 Support Agent
- **Dedicated Workspace**: View all tickets specifically assigned to the agent.
- **Status Management**: Update ticket status as progress is made (`IN_PROGRESS` ➔ `RESOLVED` ➔ `CLOSED`).
- **Response System**: Send replies and solutions directly to the customer in real-time.

### 3. 🛡️ Admin
- **System Overview**: View total users, all platform tickets, and agent workloads.
- **Ticket Assignment**: Assign unassigned tickets to specific support agents.
- **User Directory**: View all registered customers and agents.
- **Global Override**: Ability to reply to any ticket and adjust statuses.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Backend Framework** | Spring Boot 3.3.x | Standalone Java application framework |
| **Language** | Java 17 / Java 21 | Core programming language |
| **Web MVC & REST** | Spring MVC | RESTful API controllers and request mappings |
| **ORM / Persistence** | Hibernate & Spring Data JPA | Object-Relational Mapping & CRUD repositories |
| **Database** | MySQL 8.0+ | Relational Database Management System |
| **Build Tool** | Apache Maven | Backend dependency management and build |
| **Frontend Framework** | React.js 18 (Vite) | Fast, modern Single Page Application (SPA) |
| **Routing** | React Router DOM v6 | Client-side routing with role-based protected guards |
| **HTTP Client** | Axios | Promise-based HTTP client for REST API communication |
| **Styling** | Clean Vanilla CSS | Modern, responsive layout with cards, badges, and tables |

---

## 🏛️ System Architecture & Data Flow

```
React Frontend (Vite on port 5173)
       │
       │ HTTP / JSON (Axios)
       ▼
Spring Boot REST Controller (port 8080)
       │
       ▼
Service Layer (Business Logic & Validation)
       │
       ▼
Spring Data JPA Repositories
       │
       ▼
Hibernate ORM
       │
       ▼
MySQL Database (helpdesk_db on port 3306)
```

---

## 🗄️ Database Design & Schema

### Tables & Relationships

```
+--------------------+        1:N         +--------------------+
|       users        | ------------------< |      tickets       |
+--------------------+ (customer_id)       +--------------------+
| id (PK, BIGINT)    |                     | id (PK, BIGINT)    |
| name (VARCHAR)     |        1:N         | title (VARCHAR)    |
| email (VARCHAR, UNQ)| ------------------< | description (TEXT) |
| password (VARCHAR) | (assigned_agent_id) | status (VARCHAR)   |
| role (VARCHAR)     |                     | created_date (DT)  |
+--------------------+                     | customer_id (FK)   |
        │                                  | assigned_agent_id  |
        │ 1:N                              +--------------------+
        │ (user_id)                                  │ 1:N
        │                                            │ (ticket_id)
        │          +--------------------+            │
        └────────< |     responses      | >──────────┘
                   +--------------------+
                   | id (PK, BIGINT)    |
                   | message (TEXT)     |
                   | response_date (DT) |
                   | ticket_id (FK)     |
                   | user_id (FK)       |
                   +--------------------+
```

### Ticket Status Lifecycle:
- `OPEN`: Newly created by a customer, waiting for agent assignment.
- `IN_PROGRESS`: Assigned to an agent and currently being investigated.
- `RESOLVED`: Solution provided to customer.
- `CLOSED`: Completed and verified ticket.

---

## 📡 REST API Documentation

Base URL: `http://localhost:8080/api`

### 1. Authentication Endpoints
| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user | `{ "name": "...", "email": "...", "password": "...", "role": "CUSTOMER" }` | `201 Created` + `AuthResponse` |
| `POST` | `/api/auth/login` | User login | `{ "email": "...", "password": "..." }` | `200 OK` + `AuthResponse` |

### 2. Ticket Endpoints
| Method | Endpoint | Description | Request Body / Params | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/tickets` | Create support ticket | `{ "title": "...", "description": "...", "customerId": 4 }` | `201 Created` + `Ticket` |
| `GET` | `/api/tickets` | Get tickets | `?customerId=4` OR `?agentId=2` | `200 OK` + `List<Ticket>` |
| `GET` | `/api/tickets/{id}` | Get ticket details | None | `200 OK` + `Ticket` |
| `PUT` | `/api/tickets/{id}/status` | Update ticket status | `{ "status": "RESOLVED" }` | `200 OK` + `Ticket` |

### 3. Response / Conversation Endpoints
| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/tickets/{ticketId}/responses` | Post reply | `{ "message": "...", "userId": 2 }` | `201 Created` + `Response` |
| `GET` | `/api/tickets/{ticketId}/responses` | Get all replies for ticket | None | `200 OK` + `List<Response>` |

### 4. Admin Endpoints
| Method | Endpoint | Description | Request Body / Params | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | Get all users | Optional `?role=SUPPORT_AGENT` | `200 OK` + `List<User>` |
| `GET` | `/api/admin/tickets` | Get all system tickets | None | `200 OK` + `List<Ticket>` |
| `PUT` | `/api/admin/tickets/{ticketId}/assign/{agentId}` | Assign agent to ticket | None | `200 OK` + `Ticket` |

---

## 🔑 Pre-Seeded Demo Accounts for Viva

When the backend starts, it automatically seeds initial sample users and tickets if the database is empty:

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@helpdesk.com` | `admin123` | System oversight & assigning tickets |
| **Support Agent** | `agent1@helpdesk.com` | `agent123` | Handling assigned tickets & replies |
| **Support Agent** | `agent2@helpdesk.com` | `agent123` | Second agent for assignment demo |
| **Customer** | `john@customer.com` | `customer123` | Submitting & viewing tickets |
| **Customer** | `jane@customer.com` | `customer123` | Second customer with tickets |

> 💡 **Viva Tip:** The Login page includes **1-Click Demo Buttons** for instantly testing all 3 roles!

---

## 🚀 Installation & Setup Guide

### Prerequisites
- **Java**: JDK 17 or JDK 21 installed.
- **Node.js**: v18+ or v20+ with npm.
- **MySQL Server**: 8.0+ running on port 3306.

---

### Step 1: MySQL Database Setup

1. Open MySQL Command Line Client or MySQL Workbench:
```sql
CREATE DATABASE IF NOT EXISTS helpdesk_db;
```

2. (Optional) Run `database/schema.sql` and `database/data.sql`:
```bash
mysql -u root -p helpdesk_db < database/schema.sql
mysql -u root -p helpdesk_db < database/data.sql
```
*(Note: Spring Boot will also automatically generate tables via `spring.jpa.hibernate.ddl-auto=update` if you skip manual execution).*

3. Update MySQL credentials in `backend/src/main/resources/application.properties` if your password is not `root`:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

---

### Step 2: Backend Setup & Run

#### Option A: Using Eclipse / IntelliJ IDEA / VS Code (Recommended for Viva)
1. Open your IDE and select **Open Project / Import Existing Maven Project**.
2. Select the `backend/` folder.
3. Wait for Maven to download dependencies.
4. Locate `com.helpdesk.HelpdeskApplication.java`.
5. Right-click and choose **Run As ➔ Java Application** or **Run 'HelpdeskApplication'**.
6. The backend will start on `http://localhost:8080`.

#### Option B: Using Maven Command Line
```bash
cd backend
mvn spring-boot:run
```

---

### Step 3: Frontend Setup & Run

1. Open a new terminal window:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser at:
```
http://localhost:5173
```

---

## 👥 GitHub 5-Member Team Collaboration Guide

To ensure smooth collaboration without git merge conflicts, divide the workload among the 5 team members:

### 🌿 Suggested Git Branching Strategy

```
main (Production-ready, tested code)
  ├── feature/auth        (Member 1: User authentication, DTOs & security)
  ├── feature/tickets     (Member 2: Ticket CRUD, status updates & models)
  ├── feature/responses   (Member 3: Responses, conversation thread & admin assignment)
  ├── feature/frontend-ui (Member 4: React UI components, navigation & routing)
  └── feature/integration (Member 5: Axios API service integration & end-to-end testing)
```

### 👨‍💻 5-Member Role & Responsibility Matrix

| Member | Assigned Branch | Responsibilities | Files Worked On |
| :--- | :--- | :--- | :--- |
| **Member 1** (Team Lead / Auth) | `feature/auth` | User entity, registration, login API, authentication context | `User.java`, `UserRepository.java`, `UserService.java`, `AuthController.java`, `Login.jsx`, `Register.jsx` |
| **Member 2** (Backend Developer) | `feature/tickets` | Ticket entity, JPA relationships, status transitions | `Ticket.java`, `TicketRepository.java`, `TicketService.java`, `TicketController.java` |
| **Member 3** (Backend Developer) | `feature/responses` | Conversation thread, responses API, Admin assignment API | `Response.java`, `ResponseRepository.java`, `ResponseService.java`, `AdminController.java` |
| **Member 4** (Frontend Developer) | `feature/frontend-ui` | UI Design System, CSS, Reusable Components, Dashboards | `index.css`, `Navbar.jsx`, `MetricCard.jsx`, `CustomerDashboard.jsx`, `AgentDashboard.jsx`, `AdminDashboard.jsx` |
| **Member 5** (Integration & QA) | `feature/integration` | Axios API clients, Database scripts, End-to-end testing, Documentation | `api.js`, `ticketService.js`, `schema.sql`, `data.sql`, `README.md` |

### 🔄 Git Workflow Commands for Team Members

1. **Clone repository**:
   ```bash
   git clone <repo_url>
   cd customer-support-helpdesk
   ```

2. **Create and switch to feature branch**:
   ```bash
   git checkout -b feature/tickets
   ```

3. **Stage and commit changes**:
   ```bash
   git add .
   git commit -m "Add ticket creation and status update APIs"
   ```

4. **Pull latest main before pushing**:
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/tickets
   git merge main
   ```

5. **Push branch and create Pull Request (PR)**:
   ```bash
   git push origin feature/tickets
   ```

---

## 🎓 Viva Preparation & Concept Q&A

### Q1: What is the architecture of this Spring Boot application?
**Answer**: It follows a layered **MVC (Model-View-Controller) / Tiered Architecture**:
1. **Controller Layer**: Handles incoming HTTP REST requests (`@RestController`, `@GetMapping`, `@PostMapping`).
2. **Service Layer**: Contains business logic, validation, and orchestrates actions (`@Service`).
3. **Repository Layer**: Interfaces with the database using Spring Data JPA (`@Repository`, `JpaRepository`).
4. **Model/Entity Layer**: Java classes mapped to database tables (`@Entity`, `@Table`).

---

### Q2: What is JPA and Hibernate?
**Answer**:
- **JPA (Java Persistence API / Jakarta Persistence)** is a Java standard specification for Object-Relational Mapping (ORM).
- **Hibernate** is the ORM framework implementation of JPA that converts Java entity objects into MySQL SQL queries automatically.

---

### Q3: How do JPA relationships work in this project?
**Answer**:
- **Ticket to User (Customer)**: `@ManyToOne` — Many tickets can be created by one customer.
- **Ticket to User (Assigned Agent)**: `@ManyToOne` — Many tickets can be assigned to one support agent.
- **Response to Ticket**: `@ManyToOne` — Many responses belong to one ticket.
- **Response to User**: `@ManyToOne` — Many responses can be posted by one user.

---

### Q4: Why did we use DTOs (Data Transfer Objects)?
**Answer**: DTOs like `LoginRequest`, `TicketRequest`, and `AuthResponse` decouple internal database entities from external API request/response formats, preventing over-posting security vulnerabilities and infinite JSON recursion loops.

---

### Q5: What is CORS and how is it handled?
**Answer**: CORS (Cross-Origin Resource Sharing) is a browser security mechanism that blocks requests from different origins (e.g. React on `localhost:5173` making requests to Spring Boot on `localhost:8080`). We configured `CorsConfig.java` using `WebMvcConfigurer` to explicitly allow requests from the React development server.

---

### Q6: How does React Router manage role-based route protection?
**Answer**: The `ProtectedRoute.jsx` component checks the user's role from `AuthContext`. If the user is unauthenticated or does not possess the required role (e.g., a Customer trying to open `/admin/dashboard`), it automatically redirects them to their appropriate dashboard or the login screen.
