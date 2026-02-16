# Multi-Tenant Tasks Backend

A robust backend application built with Node.js, Express, and TypeScript, designed to handle multi-tenant task management efficiently.

## 🏗️ Architecture Overview

The application follows a **Layered Architecture** (Controller-Service-Repository pattern) to ensure separation of concerns, maintainability, and scalability.

- **Presentation Layer (Controllers)**: Handles incoming HTTP requests, performs basic validation, and formats responses.
- **Business Logic Layer (Services)**: Contains the core business logic, orchestrating data flow between controllers and the data access layer.
- **Data Access Layer (Models)**: managed by **Sequelize ORM**, interacting with the **PostgreSQL** database.
- **Infrastructure**: Dockerized environment for consistent deployment across development and production.

### Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)

---

## 🚀 Scalability Architecture

The application is built with a scalable architecture:

1.  **Stateless Design**:
    - The application uses **JWT** for stateless authentication.
    - This allows for **Horizontal Scaling**: Multiple backend instances can be deployed behind a load balancer without sticky sessions.

2.  **Containerization**:
    - Fully **Dockerized** application ensures consistent environments and easy scaling of backend services using orchestration tools (e.g., Kubernetes, Docker Swarm).

3.  **Asynchronous Operations**:
    - Non-blocking I/O operations and asynchronous logging (via Winston) ensure the main event loop remains responsive under load.

4.  **Data Integrity & Concurrency**:
    - **Database Transactions**: Critical operations (e.g., task creation/updates) are wrapped in Sequelize transactions to ensure atomicity and data consistency, preventing race conditions in a concurrent environment.

5.  **Security & Access Control**:
    - **Role-Based Access Control (RBAC)**: Middleware-driven permission checks allow for granular access control (e.g., Admin vs. User) without adding overhead to business logic.
    - **Soft Deletes**: Implements `paranoid` mode (soft deletes) to preserve historical data while maintaining query performance for active records.

---

## 🔒 Security Considerations

The application implements several security best practices to protect data and infrastructure:

1.  **HTTP Headers**: Uses **Helmet** middleware to set secure HTTP headers (e.g., HSTS, X-Frame-Options, X-XSS-Protection).
2.  **Authentication**:
    - **JWT Strategy**: Stateless authentication using JSON Web Tokens.
    - **Password Hashing**: User passwords are hashed using **Bcrypt** before storage.
3.  **Input Validation**:
    - Strict input validation using **Joi** schemas to prevent Injection attacks and ensure data integrity.
    - Type safety enforced by **TypeScript** throughout the codebase.
4.  **Network Security**:
    - **CORS**: Configured to restrict resource access to trusted domains.
5.  **Environment Security**: sensitive credentials and configuration are managed via `.env` files and are never committed to version control.

---

## ⚡ Performance Strategy

1.  **Response Compression**:
    - Uses **compression** middleware to reduce the size of the response body, decreasing latency and bandwidth usage.

2.  **Database Optimization**:
    - **Indexing**: Primary Keys (UUIDs) and Foreign Keys within join tables (e.g., `userId` in `ProjectUser`) are indexed for efficient lookups wherever applicable.
    - **Optimized Queries**: Uses Sequelize's `raw: true` or `lean` queries for read-only analytics operations (e.g., Project Analytics) to avoid the overhead of model instantiation.

3.  **Efficient Logging**:
    - Uses **Winston** and **Morgan** for asynchronous, structured logging.
    - Log levels are configured to avoid verbose logging in production.

4.  **Code Optimization**:
    - Non-blocking, asynchronous I/O operations are used throughout the application to prevent event loop blocking.

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose

### Installation

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd multi-tenant-tasks-back
    ```

2.  **Environment Setup**:

    ```bash
    cp .env.example .env
    # Update .env with your configuration
    ```

3.  **Run with Docker**:

    ```bash
    docker-compose up --build
    ```

4.  **Run Locally**:
    ```bash
    npm install
    npm run dev
    ```
