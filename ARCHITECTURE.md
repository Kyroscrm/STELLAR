# System Architecture

This document outlines the architecture of the Final Roofing & Retro-Fit CRM system, including database structure, key workflows, and design decisions.

## Database Schema (ER Diagram)

```
+---------------+       +---------------+       +---------------+
|    profiles   |       |     roles     |       |  permissions  |
+---------------+       +---------------+       +---------------+
| id            |<----->| id            |<----->| id            |
| user_id       |       | name          |       | name          |
| role_id       |       | description   |       | description   |
| first_name    |       | created_at    |       | created_at    |
| last_name     |       | updated_at    |       | updated_at    |
| email         |       +---------------+       +---------------+
| phone         |               ^
| created_at    |               |
| updated_at    |       +---------------+
+---------------+       | role_permissions|
        ^               +---------------+
        |               | role_id       |
        |               | permission_id |
        v               +---------------+
+---------------+
|  user_sessions |
+---------------+
| id            |
| user_id       |
| login_time    |
| logout_time   |
| ip_address    |
| user_agent    |
| is_active     |
+---------------+
        ^
        |
        v
+---------------+       +---------------+       +---------------+
| activity_logs |       |     leads     |       |   customers   |
+---------------+       +---------------+       +---------------+
| id            |       | id            |       | id            |
| user_id       |       | user_id       |       | user_id       |
| entity_type   |       | first_name    |       | first_name    |
| entity_id     |       | last_name     |       | last_name     |
| action        |       | email         |       | email         |
| description   |       | phone         |       | phone         |
| old_data      |       | status        |       | address       |
| new_data      |       | source        |       | created_at    |
| created_at    |       | created_at    |       | updated_at    |
+---------------+       | updated_at    |       +---------------+
                        +---------------+              ^
                                ^                      |
                                |                      |
                                v                      v
+---------------+       +---------------+       +---------------+
|   estimates   |       |     jobs      |       |   invoices    |
+---------------+       +---------------+       +---------------+
| id            |       | id            |       | id            |
| user_id       |<----->| user_id       |<----->| user_id       |
| customer_id   |       | customer_id   |       | customer_id   |
| total_amount  |       | estimate_id   |       | job_id        |
| status        |       | title         |       | estimate_id   |
| created_at    |       | description   |       | total_amount  |
| updated_at    |       | status        |       | status        |
+---------------+       | start_date    |       | due_date      |
        ^               | end_date      |       | paid_at       |
        |               | created_at    |       | created_at    |
        |               | updated_at    |       | updated_at    |
        v               +---------------+       +---------------+
+---------------+               ^                      ^
|estimate_line_items|           |                      |
+---------------+               |                      |
| id            |               v                      v
| estimate_id   |       +---------------+       +---------------+
| description   |       |     tasks     |       |invoice_line_items|
| quantity      |       +---------------+       +---------------+
| unit_price    |       | id            |       | id            |
| total         |       | user_id       |       | invoice_id    |
| sort_order    |       | job_id        |       | description   |
| created_at    |       | title         |       | quantity      |
| updated_at    |       | description   |       | unit_price    |
+---------------+       | status        |       | total         |
                        | due_date      |       | sort_order    |
                        | created_at    |       | created_at    |
                        | updated_at    |       | updated_at    |
                        +---------------+       +---------------+
```

## Key Workflows

### 1. Role-Based Access Control (RBAC) Flow

```
┌──────────┐     ┌───────────────┐     ┌─────────────┐     ┌───────────────┐
│  Client  │────>│ AuthContext   │────>│ enforcePolicy │────>│ has_permission │
│  Request │     │ (user, session)│     │ (permission) │     │ (user_id, perm)│
└──────────┘     └───────────────┘     └─────────────┘     └───────────────┘
                                              │                    │
                                              v                    v
┌──────────┐     ┌───────────────┐     ┌─────────────┐     ┌───────────────┐
│ Component│<────│ UI Rendering  │<────│ Permission  │<────│ RLS Policies  │
│ Display  │     │ Decision      │     │ Check Result│     │ (Database)    │
└──────────┘     └───────────────┘     └─────────────┘     └───────────────┘
```

### 2. Audit Logging Flow

```
┌──────────┐     ┌───────────────┐     ┌─────────────┐
│ Database │────>│ DB Trigger    │────>│audit_trigger │
│ Change   │     │ on Table      │     │ Function    │
└──────────┘     └───────────────┘     └─────────────┘
                                              │
                                              v
┌──────────┐     ┌───────────────┐     ┌─────────────┐
│ Activity │<────│ Field Change  │<────│ Metadata    │
│ Log Entry│     │ Detection     │     │ Collection  │
└──────────┘     └───────────────┘     └─────────────┘
```

### 3. Optimistic Update Flow in Hooks

```
┌──────────┐     ┌───────────────┐     ┌─────────────┐
│ User     │────>│ UI Action     │────>│executeUpdate │
│ Action   │     │ (Form Submit) │     │ Function    │
└──────────┘     └───────────────┘     └─────────────┘
                                              │
                        ┌───────────────┐     │
                        │ Optimistic    │<────┘
                        │ State Update  │
                        └───────────────┘
                                │
                                v
┌──────────┐     ┌───────────────┐     ┌─────────────┐
│ Success  │     │ API Request   │────>│ Supabase    │
│ Toast    │<────┤ to Supabase   │     │ Database    │
└──────────┘     └───────────────┘     └─────────────┘
      ^                  │                    │
      │                  │                    │
      │          ┌───────┴───────┐     ┌─────┴─────┐
      └──────────┤ Success Path  │     │ Error Path │
                 └───────────────┘     └─────┬─────┘
                                              │
                        ┌───────────────┐     │
                        │ Rollback      │<────┘
                        │ State Update  │
                        └───────────────┘
                                │
                                v
                        ┌───────────────┐
                        │ Error Toast   │
                        │ Notification  │
                        └───────────────┘
```

## Key Design Decisions

### 1. Supabase as Backend

We chose Supabase for our backend solution for several key reasons:

- **PostgreSQL Database**: Provides robust relational database capabilities with advanced features
- **Built-in Authentication**: Secure auth system with multiple providers and session management
- **Row-Level Security (RLS)**: Enforces access control at the database level
- **Edge Functions**: Allows serverless function execution for business logic
- **Real-time Subscriptions**: Enables live data updates without polling
- **Storage**: Integrated file storage with access controls

### 2. Optimistic UI Updates

We implemented optimistic UI updates throughout the application to provide a responsive user experience:

- **Immediate Feedback**: UI updates immediately without waiting for server response
- **Automatic Rollback**: If server request fails, UI state is rolled back
- **Toast Notifications**: Success/error messages inform users of operation status
- **Consistent Pattern**: All data mutations follow the same optimistic update pattern

### 3. Role-Based Access Control

Our RBAC system provides fine-grained control over user permissions:

- **Database-Level**: Permissions enforced via RLS policies
- **Application-Level**: UI components conditionally render based on permissions
- **Centralized Logic**: `enforcePolicy` helper ensures consistent permission checks
- **Audit Trail**: All permission checks are logged for security monitoring

### 4. Comprehensive Audit Logging

We implemented a detailed audit logging system to track all changes:

- **Field-Level Changes**: Captures old and new values for each changed field
- **Automatic Triggers**: Database triggers record changes without application code
- **User Context**: Logs include user ID, session ID, IP address, and user agent
- **Compliance Support**: Structured for regulatory compliance requirements

### 5. Testing Strategy

Our testing approach ensures high quality and reliability:

- **Unit Tests**: For individual components and utility functions
- **Integration Tests**: For workflows spanning multiple components
- **Database Tests**: For SQL functions, triggers, and RLS policies
- **Mock Services**: MSW for mocking API responses in tests

## Technology Choices

- **React + TypeScript**: Strong typing reduces bugs and improves developer experience
- **Vite**: Fast development server and optimized production builds
- **TanStack Query**: Data fetching, caching, and state management
- **React Hook Form**: Performant, flexible form handling with validation
- **Tailwind CSS**: Utility-first CSS framework for consistent styling
- **shadcn/ui**: High-quality, accessible UI components
- **Cursor AI Pro**: AI-assisted development for faster coding and documentation

## Monitoring & Alerting

### APM Integration
- Frontend: Sentry for React error tracking and performance monitoring
  - Error tracking with source maps
  - Performance monitoring with custom sampling rates
  - Real user monitoring (RUM) for frontend performance
- Edge Functions: Sentry for serverless monitoring
  - Error tracking and performance monitoring
  - Custom transaction sampling based on endpoint type

### Health Checks
- `/health` endpoint in Edge Functions providing:
  - Service uptime
  - Memory usage metrics
  - Basic health status
- Automated health checks every 5 minutes via GitHub Actions

### Alert Thresholds
- Error Rate:
  - Trigger if >1% of requests error in 5 minutes
  - Monitored via Sentry error tracking
- Latency:
  - API endpoints: Alert if p95 > 500ms
  - Dashboard operations: Alert if p95 > 1000ms
- Resource Usage:
  - Memory: Alert if heap usage > 512MB or RSS > 1GB
  - CPU: Monitored via Edge Function metrics

### Notification Channels
- Primary: Slack alerts via webhook
- Secondary: Email notifications
- Alert routing based on severity and type
- Automated incident creation for critical alerts

### Monitoring Dashboard
- Real-time metrics:
  - Error rates and trends
  - Latency percentiles
  - User session data
  - Cache hit rates
- Historical data retention: 30 days
- Custom metric collection for business KPIs

### CI/CD Integration
- Deployment markers in APM
- Automated performance regression detection
- Release tracking in error reports

### Critical Features

#### Point-in-Time Recovery (PITR)
PITR is a mission-critical feature for our database backup strategy:
- Continuous WAL archiving for up to 7 days retention
- Enables recovery to any point within the retention period
- Integrated with health monitoring for status checks
- See [Supabase PITR Documentation](https://supabase.com/docs/guides/platform/backups#point-in-time-recovery) for details

Regular testing schedule:
- Weekly automated PITR status checks
- Quarterly restore tests in staging environment
- Documented recovery procedures and test results
