# Limitations & Future Improvements

## ⚠️ Known Weaknesses

### 1. Lack of Real-Time Updates

- **Current State**: The API is purely RESTful. Clients must poll for updates (e.g., task status changes).
- **Impact**: Increased server load due to polling; not ideal for collaborative features where instant feedback is expected.

### 2. Database Connection Contention

- **Current State**: Relies on Sequelize's internal connection pool.
- **Impact**: Under extreme high load (>10k concurrent reqs), the application might exhaust database connections. A dedicated external pooler (PgBouncer) would be needed but is not currently implemented.

### 3. Limited Observability

- **Current State**: Basic logging via Winston (console/file).
- **Impact**: Debugging production issues might be difficult without centralized logging (ELK Stack, Datadog) or APM (Application Performance Monitoring) tools.

---

## 🚀 Improvements with More Time

If given more time, the following enhancements would be prioritized:

### 1. Infrastructure & Performance

- **Redis Caching**: Implement Redis to cache `GET /tasks` and `GET /projects` responses, and manage user sessions for faster authentication.
- **Rate Limiting**: Implement a distributed rate limiter (using Redis) to protect the API from abuse and DDoS attacks.

### 2. Testing & Quality Assurance

- **Comprehensive Test Suite**: Set up **Jest** and **Supertest** for:
  - **Unit Tests**: Isolating service logic.
  - **Integration Tests**: Verifying API endpoints and database interactions.
- **CI/CD Pipeline**: Create GitHub Actions workflows to automatically lint, build, and test code on every push.

### 3. Developer Experience & Documentation

- **Swagger/OpenAPI**: Auto-generate interactive API documentation to help frontend developers and external consumers understand the API contract.
- **Docker Compose**: Enhance the Docker setup to include hot-reloading (volumes) and a seeded database for a smoother "clone-and-run" experience.

### 4. Advanced Features

- **WebSockets (Socket.io)**: Implement real-time notifications for task assignments and status updates.
- **Granular Permissions**: Expand RBAC to support custom roles and resource-level permissions (e.g., "Can view but not edit specific tasks").
