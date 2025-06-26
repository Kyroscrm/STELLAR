# TASK.md: Final Roofing & Retro-Fit CRM - Detailed Action Plan

This document outlines the detailed tasks required for each phase of the CRM's development towards 100% enterprise readiness.

## Phase 1: Foundation & Security Hardening

**Current State:**
*   Basic user authentication (`AuthContext`).
*   Initial `activity_logs` table with basic logging.
*   RLS policies are present but may not be fully granular or cover all new scenarios.
*   `profiles` table exists with basic user info and `user_role` enum.
*   `useErrorHandler` and `useOptimisticUpdate` hooks are implemented.
*   `GlobalErrorBoundary` is in place.

**Completed Tasks:**
*   ✅ **TypeScript Error Resolution:** Fixed all 515 TypeScript errors across 113 files including:
    *   Fixed null handling in hooks (useProfile, useTasks, usePaymentMethods)
    *   Resolved type mismatches in ConvertLeadDialog
    *   Fixed dashboard stats data fetching with proper fallback queries
    *   Improved type safety throughout the application
*   ✅ **RLS Migration File Created:** Comprehensive RLS policy cleanup migration file created at `supabase/migrations/20250625120000-comprehensive-rls-policy-cleanup.sql`
*   ✅ **Code Quality Improvements:** Enhanced error handling and null safety patterns

**In Progress Tasks:**

### 1.1 Granular Role-Based Access Control (RBAC)
*   **Objective:** Implement a flexible RBAC system to control user permissions beyond simple roles.
*   **Backend (Supabase):**
    *   [ ] **Database Schema:**
        *   [ ] Apply RLS cleanup migration to Supabase instance
        *   [ ] Create `roles` table: `id (PK)`, `name (UNIQUE)`, `description`.
        *   [ ] Create `permissions` table: `id (PK)`, `name (UNIQUE)`, `description`.
        *   [ ] Create `role_permissions` junction table: `role_id (FK)`, `permission_id (FK)`.
        *   [ ] Modify `profiles` table: Add `role_id (FK to roles.id)`.
        *   [ ] Update `is_admin` function: Create new Supabase functions (e.g., `has_permission(user_id UUID, permission_name TEXT)`) to check permissions based on `role_permissions`.
    *   [ ] **RLS Policies:**
        *   [ ] Verify and test the new RLS policies from the cleanup migration
        *   [ ] Update any remaining policies to use the new `has_permission` function.
*   **Frontend (React):**
    *   [ ] **`AuthContext`:** Enhance `AuthContext` to fetch user's permissions on login/session refresh.
    *   [ ] **`ProtectedRoute`:** Update `ProtectedRoute` to check for specific permissions instead of just roles (e.g., `allowedPermissions={['leads:read', 'jobs:write']}`).
    *   [ ] **UI Components:** Implement conditional rendering in UI components (e.g., buttons, menu items) based on user permissions.

### 1.2 Comprehensive Audit Trails
*   **Objective:** Capture detailed audit information for all critical data changes.
*   **Backend (Supabase):**
    *   [ ] **Database Schema:**
        *   [ ] Modify `activity_logs` table:
            *   Add `old_data JSONB` and `new_data JSONB` columns to store full record state before/after update/insert.
            *   Add `changed_fields TEXT[]` to list specific fields modified.
            *   Add `ip_address INET` and `user_agent TEXT` columns.
            *   Add `session_id UUID` (FK to new `user_sessions` table).
            *   Add `compliance_level ENUM ('standard', 'high', 'critical')`.
            *   Add `risk_score INTEGER`.
        *   [ ] Create `user_sessions` table: `id (PK, UUID)`, `user_id (FK)`, `login_time TIMESTAMP WITH TIME ZONE`, `logout_time TIMESTAMP WITH TIME ZONE`, `ip_address INET`, `user_agent TEXT`.
    *   [ ] **Database Triggers:**
        *   [ ] Create PostgreSQL triggers on `INSERT`, `UPDATE`, `DELETE` for critical tables (`customers`, `jobs`, `estimates`, `invoices`, `profiles`, `payment_methods`, `signed_documents`) to automatically populate `activity_logs` with `old_data`, `new_data`, `changed_fields`.
        *   [ ] Update `log_activity` RPC function to accept and store these new fields.
*   **Frontend (React):**
    *   [ ] **`useActivityLogs` / `useEnhancedActivityLogs`:** Update hooks to fetch and display the new detailed audit information.
    *   [ ] **`ActivityLogViewer`:** Enhance the UI to show `old_data`/`new_data` diffs, `changed_fields`, `IP address`, `user_agent`, `compliance_level`, and `risk_score`.

### 1.3 Multi-Factor Authentication (MFA) & Password Policies
*   **Objective:** Enhance user authentication security.
*   **Backend (Supabase):**
    *   [ ] **Supabase Auth:** Configure Supabase to enforce MFA (if supported directly) or integrate with an external MFA provider.
    *   [ ] **Password Policies:** Configure Supabase Auth to enforce strong password policies (min length, complexity, expiration).
*   **Frontend (React):**
    *   [ ] **Login/Register UI:** Update `Login` and `Register` components to guide users through MFA setup and password policy adherence.
    *   [ ] **Profile Settings:** Add a section in `UserProfile` or `SecuritySettings` to manage MFA settings.

### 1.4 Data Retention Policies
*   **Objective:** Define and manage data lifecycle for compliance.
*   **Backend (Supabase):**
    *   [ ] **Database Schema:**
        *   [ ] Create `data_retention_policies` table: `id (PK)`, `table_name (UNIQUE)`, `retention_period INTERVAL`, `policy_type ENUM ('automatic', 'manual', 'legal_hold')`, `compliance_requirement TEXT`, `auto_delete BOOLEAN`.
        *   [ ] Add `deleted_at TIMESTAMP WITH TIME ZONE` column to relevant tables (`leads`, `customers`, `jobs`, etc.) for soft deletes.
    *   [ ] **Edge Functions:**
        *   [ ] Create a Supabase Edge Function (`data-cleanup-worker`) to periodically run and identify records for soft deletion or hard deletion based on `data_retention_policies`.
        *   [ ] Implement a mechanism to trigger this function (e.g., Supabase Scheduled Jobs).
*   **Frontend (React):**
    *   [ ] **`useDataRetention`:** Implement the `useDataRetention` hook to manage and display retention policies.
    *   [ ] **Settings UI:** Create a new UI component in `SettingsPage` to configure and view data retention policies.

### 1.5 Enhanced Error Handling & Monitoring
*   **Objective:** Improve error visibility and application stability.
*   **Backend (Supabase Edge Functions):**
    *   [ ] **Centralized Logging:** Configure Edge Functions to send logs to a centralized logging service (e.g., Logtail, Datadog).
    *   [ ] **Error Alerts:** Set up alerts for critical errors in Edge Functions.
*   **Frontend (React):**
    *   [x] **`useErrorHandler`:** Ensure `useErrorHandler` is used consistently across all data mutations and fetches.
    *   [ ] **Sentry Integration:** Integrate Sentry (or similar APM) for real-time error tracking and performance monitoring in the React application.
*   **General:**
    *   [ ] **Health Checks:** Implement API endpoints for health checks (e.g., `/health`) to monitor service availability.

### 1.6 External API Integrations Setup
*   **Objective:** Establish secure integration foundations.
*   **Tasks:**
    *   [ ] **Stripe Integration:** Create Stripe payment processing endpoints
    *   [ ] **Twilio Integration:** Set up SMS/communication services
    *   [ ] **Resend Integration:** Configure email delivery service
    *   [ ] **Signwell Integration:** Implement e-signature functionality
    *   [ ] **OpenAI Integration:** Set up AI-powered features

**Discovered During Work:**
*   🔍 **Database Connection Issue:** Supabase project not linked locally - need to establish connection for migration deployment
*   🔍 **Payment Method Type Safety:** Fixed boolean null handling in payment methods
*   🔍 **Dashboard Stats Optimization:** Replaced materialized view queries with direct table queries for better reliability
*   🔍 **Lead Conversion Props:** Fixed type mismatches in ConvertLeadDialog component

## Phase 2: Core Automation & Operational Efficiency

**Current State:**
*   Basic CRUD operations for `leads`, `customers`, `jobs`, `estimates`, `invoices`, `tasks`.
*   `client_portal_tokens` table exists but is not fully utilized.
*   `estimate_automations` table exists but is basic.
*   `workflows` table exists but is basic.

**Tasks:**

### 2.1 Advanced Lead Management & Automation
*   **Objective:** Automate lead processing and improve conversion rates.
*   **Backend (Supabase):**
    *   [ ] **Lead Scoring Logic:** Implement a Supabase Edge Function (`calculate-lead-score`) that updates `leads.score` based on `source`, `estimated_value`, and engagement (e.g., `activity_logs` related to lead).
    *   [ ] **Lead Assignment:** Create a Supabase Edge Function (`assign-lead`) that assigns new leads to `user_id`s based on predefined rules (e.g., round-robin, territory).
    *   [ ] **Automated Nurturing Triggers:** Enhance `workflows` table to define triggers for lead status changes (e.g., `lead_status = 'new'`).
*   **Frontend (React):**
    *   [ ] **Lead Detail View:** Display `lead.score` prominently.
    *   [ ] **Lead Creation:** Ensure new leads trigger the `assign-lead` Edge Function.

### 2.2 Enhanced Client Portal
*   **Objective:** Provide a comprehensive self-service portal for clients.
*   **Backend (Supabase):**
    *   [ ] **RLS Policies:** Create specific RLS policies for `client` role to access their own `jobs`, `estimates`, `invoices`, `documents`, and `media_files`.
    *   [ ] **Edge Functions:**
        *   [ ] `generate-client-portal-token`: RPC function to generate secure, time-limited tokens for client access.
        *   [ ] `client-portal-webhook`: Edge Function to handle client actions (e.g., estimate approval, document signing).
*   **Frontend (React):**
    *   [ ] **Client Dashboard (`ClientDashboard.tsx`):**
        *   [ ] Display client's `jobs` with progress, `invoices` with payment status, and `estimates` with approval options.
        *   [ ] Implement document viewing and signing functionality (using `useDocumentSignature`).
        *   [ ] Allow clients to upload `media_files` related to their jobs.
    *   [ ] **Estimate/Invoice Sharing:** Add functionality to `EstimatesPage` and `InvoicesPage` to generate and send client portal links.

### 2.3 Enhanced Project & Job Lifecycle Management
*   **Objective:** Improve job tracking and resource allocation.
*   **Backend (Supabase):**
    *   [ ] **Database Schema:**
        *   [ ] Modify `jobs` table: Add `crew_id (FK to new crews table)`, `project_manager_id (FK to profiles)`.
        *   [ ] Create `crews` table: `id (PK)`, `name`, `members TEXT[]`.
        *   [ ] Modify `tasks` table: Add `parent_task_id (FK to tasks.id)`, `dependency_type ENUM ('starts_after', 'finishes_after')`.
        *   [ ] Create `materials` table: `id (PK)`, `name`, `unit_cost`, `unit_of_measure`.
        *   [ ] Create `job_materials` table: `job_id (FK)`, `material_id (FK)`, `quantity`, `cost`.
        *   [ ] Create `time_entries` table: `id (PK)`, `user_id (FK)`, `job_id (FK)`, `task_id (FK)`, `start_time`, `end_time`, `hours_logged NUMERIC(6,2)`, `description`.
        *   [ ] Create `change_orders` table: `id (PK)`, `job_id (FK)`, `description`, `amount NUMERIC(10,2)`, `status ENUM ('pending', 'approved', 'rejected')`, `approved_by_client BOOLEAN`.
    *   [ ] **Edge Functions:**
        *   [ ] `update-job-progress`: Function to calculate job progress based on completed tasks.
        *   [ ] `calculate-job-cost`: Function to sum `job_materials` and `time_entries` costs.
*   **Frontend (React):**
    *   [ ] **Job Detail View:** Display crew, project manager, and detailed cost breakdown.
    *   [ ] **Task Management:** Implement UI for parent/sub-tasks and dependencies.
    *   [ ] **Time Tracking:** Add a component for users to log time against jobs/tasks.
    *   [ ] **Change Order UI:** Implement CRUD for `change_orders` linked to jobs.

### 2.4 Sophisticated Financial Management
*   **Objective:** Automate billing and payment processes.
*   **Backend (Supabase):**
    *   [ ] **Database Schema:**
        *   [ ] Create `recurring_invoices` table: `id (PK)`, `user_id (FK)`, `customer_id (FK)`, `template_invoice_id (FK to invoices)`, `frequency ENUM ('monthly', 'quarterly', 'annually')`, `start_date`, `end_date`, `next_invoice_date`.
        *   [ ] Modify `invoices` table: Add `amount_paid NUMERIC(10,2)`, `balance_due NUMERIC(10,2)`.
        *   [ ] Create `credit_notes` table: `id (PK)`, `invoice_id (FK)`, `amount NUMERIC(10,2)`, `reason`.
        *   [ ] Create `expenses` table: `id (PK)`, `user_id (FK)`, `job_id (FK)`, `category`, `amount NUMERIC(10,2)`, `date`, `description`.
    *   [ ] **Edge Functions:**
        *   [ ] `generate-recurring-invoices`: Function to create invoices based on `recurring_invoices` schedule.
        *   [ ] `process-payment-webhook`: Function to handle payment gateway webhooks and update `invoices.amount_paid` and `payment_status`.
*   **Frontend (React):**
    *   [ ] **Invoices Page:** Add UI for managing recurring invoices, recording partial payments, and issuing credit notes.
    *   [ ] **Expenses Tracking:** Create a new page/component for tracking and linking expenses to jobs.

### 2.5 Workflow Automation Engine
*   **Objective:** Provide a flexible and powerful system for custom business process automation.
*   **Backend (Supabase):**
    *   [ ] **Database Schema:**
        *   [ ] Enhance `workflows` table: `trigger_conditions JSONB` (for complex conditions), `actions JSONB` (array of actions with config).
        *   [ ] Create `workflow_logs` table: `id (PK)`, `workflow_id (FK)`, `trigger_data JSONB`, `actions_executed JSONB`, `success BOOLEAN`, `error_message TEXT`, `execution_time INTEGER`.
    *   [ ] **Edge Functions:**
        *   [ ] `workflow-trigger-listener`: Generic function to listen for database changes and evaluate `trigger_conditions`.
        *   [ ] `workflow-action-executor`: Function to execute defined actions (e.g., send email, create task, update record).
*   **Frontend (React):**
    *   [ ] **Workflow Builder UI:** Create a visual (or form-based) builder in `SettingsPage` to define custom workflows, triggers, and actions.
    *   [ ] **Workflow Logs Viewer:** Display `workflow_logs` for monitoring automation execution.

## Phase 3: Advanced Analytics & Strategic Insights

**Current State:**
*   `dashboard_layouts` and `dashboard_widgets` tables exist.
*   `kpis` table exists.
*   `useDashboardStats` and `useAdvancedAnalytics` hooks provide some metrics.
*   `reports` table exists but is basic.

**Tasks:**

### 3.1 Customizable Dashboards & KPIs
*   **Objective:** Empower users with personalized, data-rich dashboards.
*   **Backend (Supabase):**
    *   [ ] **Database Schema:**
        *   [ ] Enhance `kpis` table: Add `target_value NUMERIC`, `unit TEXT`, `period ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'annually')`.
        *   [ ] Create `dashboard_preferences` table: `user_id (PK)`, `layout JSONB`, `widget_positions JSONB`, `visible_widgets TEXT[]`, `theme_settings JSONB`.
        *   [ ] Create `dashboard_metrics_cache` table: `user_id (PK)`, `metric_type TEXT`, `value NUMERIC`, `period TEXT`, `calculated_at TIMESTAMP WITH TIME ZONE`, `expires_at TIMESTAMP WITH TIME ZONE`.
    *   [ ] **Edge Functions:**
        *   [ ] `calculate-kpis`: Scheduled function to pre-calculate and cache complex KPIs into `dashboard_metrics_cache`.
*   **Frontend (React):**
    *   [ ] **Dashboard Customization UI:** Implement drag-and-drop functionality for widgets, and options to select/configure KPIs.
    *   [ ] **`useDashboardPreferences`:** Implement this hook to manage user-specific dashboard settings.
    *   [ ] **`DashboardMetrics`:** Update to fetch data from `dashboard_metrics_cache` and display customizable KPIs.

### 3.2 Advanced Reporting & Forecasting
*   **Objective:** Provide deep insights into business performance.
*   **Backend (Supabase):**
    *   [ ] **Database Schema:**
        *   [ ] Enhance `reports` table: `query JSONB` (for dynamic report queries), `filters JSONB`, `schedule JSONB` (for automated generation).
        *   [ ] Create `report_templates` table: `id (PK)`, `name`, `definition JSONB`.
    *   [ ] **Edge Functions:**
        *   [ ] `generate-report`: Function to execute dynamic queries, format data, and generate reports (e.g., CSV, PDF).
        *   [ ] `schedule-report-delivery`: Function to send generated reports via email.
*   **Frontend (React):**
    *   [ ] **Report Builder UI:** Create a UI for users to define custom reports using filters and data selections.
    *   [ ] **Report Scheduling:** Allow users to schedule report generation and delivery.
    *   [ ] **Forecasting Visualizations:** Integrate charts and graphs to display sales and project forecasts.

## Phase 4: Ecosystem Integration & Scalability

**Current State:**
*   `calendar_integrations` and `payment_methods` tables exist.
*   `accounting_settings` table exists.
*   `signed_documents` table exists.

**Tasks:**

### 4.1 Accounting Software Integration
*   **Objective:** Automate financial data synchronization.
*   **Backend (Supabase Edge Functions):**
    *   [ ] **OAuth Flow:** Implement OAuth 2.0 flow for connecting to QuickBooks/Xero APIs.
    *   [ ] **Data Sync Functions:**
        *   [ ] `sync-invoices-to-accounting`: Push new/updated `invoices` to accounting software.
        *   [ ] `sync-payments-from-accounting`: Pull `payments` from accounting software.
        *   [ ] `sync-expenses-to-accounting`: Push `expenses` to accounting software.
    *   [ ] **Webhook Handlers:** Set up Edge Functions to receive webhooks from accounting software for real-time updates.
*   **Frontend (React):**
    *   [ ] **Integrations Page:** Enhance `Accounting Integration` section to initiate OAuth, display sync status, and configure sync settings.

### 4.2 Communication Integrations
*   **Objective:** Centralize and automate communication channels.
*   **Backend (Supabase Edge Functions):**
    *   [ ] **Email Sending:** Implement an Edge Function (`send-email`) using an ESP's API (e.g., SendGrid, Mailgun) for transactional and marketing emails.
    *   [ ] **SMS Sending:** Implement an Edge Function (`send-sms`) using an SMS provider's API (e.g., Twilio).
    *   [ ] **Email/SMS Templates:** Store reusable email/SMS templates in a new `communication_templates` table.
*   **Frontend (React):**
    *   [ ] **Email/SMS Composer:** Add UI components to send emails/SMS directly from `lead`, `customer`, `estimate`, `invoice` detail pages.
    *   [ ] **Template Management:** UI for creating and managing communication templates.

### 4.3 Cloud Storage Integration
*   **Objective:** Optimize storage for large volumes of files.
*   **Backend (Supabase Edge Functions):**
    *   [ ] **File Upload Proxy:** Implement an Edge Function to proxy file uploads to a dedicated cloud storage (e.g., AWS S3) for better scalability and cost control.
    *   [ ] **File Access Control:** Ensure RLS policies are applied to file access, even when stored externally.
*   **Frontend (React):**
    *   [ ] **File Uploads:** Update existing file upload components to use the new proxy.
    *   [ ] **File Management:** Display and manage files stored in the external cloud storage.

### 4.4 Performance Optimization & Scalability
*   **Objective:** Ensure the CRM remains fast and responsive under load.
*   **Backend (Supabase):**
    *   [ ] **Database Indexing:** Review and add appropriate indexes to frequently queried columns.
    *   [ ] **Query Optimization:** Refactor complex SQL queries for better performance.
    *   [ ] **Connection Pooling:** Ensure efficient database connection management.
    *   [ ] **Background Jobs:** Migrate all long-running operations (e.g., report generation, bulk data processing) to Supabase Edge Functions or external job queues.
*   **Frontend (React):**
    *   [ ] **Code Splitting:** Implement lazy loading for routes and components to reduce initial bundle size.
    *   [ ] **Data Fetching Strategy:** Optimize data fetching with TanStack Query (e.g., `staleTime`, `cacheTime`, `refetchOnWindowFocus`).
    *   [ ] **Virtualization:** Use UI virtualization for large lists (e.g., `react-window`, `react-virtualized`) to improve rendering performance.

### 4.5 Disaster Recovery & Backup
*   **Objective:** Ensure business continuity and data safety.
*   **Backend (Supabase):**
    *   [ ] **Automated Backups:** Configure Supabase's native backup features (Point-in-Time Recovery).
    *   [ ] **Backup Monitoring:** Set up alerts for backup failures.
    *   [ ] **Restore Procedures:** Document and test data restoration procedures.
*   **Frontend (React):**
    *   [ ] **Settings UI:** Add a section in `SecuritySettings` to view backup status and initiate manual backups (if applicable).

### 4.6 Advanced Security Enhancements
*   **Objective:** Protect against sophisticated threats.
*   **Backend (Supabase):**
    *   [ ] **SSO Integration:** Implement Single Sign-On (SSO) using Supabase's enterprise authentication features.
    *   [ ] **API Rate Limiting:** Implement rate limiting on critical API endpoints (via Edge Functions or API Gateway) to prevent abuse and DDoS attacks.
    *   [ ] **Web Application Firewall (WAF):** Deploy a WAF in front of the application (if self-hosting or using a cloud provider that offers it).
*   **Frontend (React):**
    *   [ ] **Security Dashboard:** Enhance `SecurityDashboard` to display real-time threat intelligence and compliance status.

**Next Immediate Actions:**
1. Link Supabase project locally to apply RLS migration
2. Set up external API integrations (Stripe, Twilio, etc.)
3. Begin Phase 1 RBAC implementation
4. Create comprehensive test suite for new functionality
