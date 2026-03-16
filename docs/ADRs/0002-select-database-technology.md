# ADR 2: Select PostgreSQL as the Primary Relational Database

## Status
Proposed

## Date
2026-03-15

## Context
The application requires a robust, ACID-compliant relational database to manage project configurations, user data, and generated prompts. We need a solution that supports complex queries, has strong community support, and integrates well with our Node.js/TypeScript backend. We considered MySQL and PostgreSQL.

## Decision
We will use PostgreSQL as our primary relational database.

## Consequences
### Positive
- **Advanced Features:** PostgreSQL offers advanced data types (JSONB) and powerful indexing options.
- **Reliability:** Strong reputation for data integrity and reliability.
- **Ecosystem:** Excellent support for TypeScript via ORMs like Prisma or Drizzle.

### Negative
- **Operational Complexity:** Slightly more complex to tune and manage compared to MySQL in some environments.
- **Resource Usage:** Can be more memory-intensive than MySQL for certain workloads.

## Related Decisions
- ADR 1: Choose Microservices Architecture for Scalability
