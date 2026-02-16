# Architecture Decisions & Trade-offs

## 1. Database Model Choice: PostgreSQL + Sequelize

### Decision

We chose **PostgreSQL** as the relational database and **Sequelize** as the Object-Relational Mapper (ORM).

### Justification (`Why chosen DB model`)

- **Structured Data**: The core domain (Users, Organizations, Projects, Tasks) is highly relational. Concepts like "User belongs to Organization" and "Task belongs to Project" maps naturally to a relational schema with constraints.
- **ACID Compliance**: Task management requires strict data integrity (e.g., ensuring a task isn't assigned to a deleted user). PostgreSQL's transactional support is robust.
- **Productivity**: Sequelize provides a powerful abstraction layer, speeding up development with model definitions, migration management, and built-in validation (e.g., `allowNull: false`, `unique: true`).
- **Safety**: The ORM automatically handles parameterization, protecting against SQL injection attacks.

## 2. Deprioritized Items (`What was deprioritized`)

To focus on delivering a robust MVP (Minimum Viable Product) within constraints, the following features were consciously deprioritized but are noted for future iterations:

- **Advanced Caching Layer**: Implementing Redis for caching user sessions or frequent queries was skipped. While beneficial for ultra-high scale, it adds infrastructure complexity that wasn't strictly necessary for the initial target load.
- **Message Queues**: Asynchronous processing is currently handled within the application process or simple async functions. A dedicated message queue (RabbitMQ/Kafka) was deemed overkill for the current scope.
- **Comprehensive Test Suite**: While the structure for tests exists, a full suite of automated integration/E2E tests was deprioritized in favor of manual verification scripts to speed up initial feature delivery.
- **GraphQL**: REST was chosen over GraphQL for simplicity and standard tooling compatibility, though GraphQL could offer more flexible data fetching for the frontend in the future.

## 3. Trade-offs Made

### ORM vs. Raw SQL

- **Decision**: Use Sequelize for most operations.
- **Trade-off**: We gain **development speed** and **code maintainability** at the cost of some **runtime performance overhead**.
- **Mitigation**: For performance-critical read operations (like the Analytics API), we use Sequelize's `raw: true` option to bypass model instantiation and approach raw SQL speeds.

### Monolith vs. Microservices

- **Decision**: Built as a modular Monolith.
- **Trade-off**: We gain **simplicity** in deployment, testing, and development (no distributed system problems). The downside is **tighter coupling** compared to microservices, which might require refactoring if the team/codebase grows significantly.
- **Mitigation**: The codebase is structured with clear Service/Controller boundaries, making future extraction of services (e.g., an independent "Analytics Service") easier.

### Stateless Authentication (JWT)

- **Decision**: Use JWTs without server-side session storage.
- **Trade-off**: We gain **infinite horizontal scalability** (no shared session state needed). The downside is **immediate revocation difficulty**; we cannot instantly invalidate a specific token without adding a stateful blacklist (which was deprioritized).
- **Mitigation**: Short token expiration times can limit the window of exposure.
