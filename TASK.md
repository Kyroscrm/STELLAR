## 🔧 Required Fixes & Feature Gaps

### Forms & Modals
- [ ] Replace all basic `useState` input handling with `react-hook-form`.
- [ ] Add form validation rules to every form modal (email, required, maxLength, etc.).
- [ ] Ensure modals like `CreateLeadDialog`, `EditInvoiceDialog`, etc., perform proper Supabase mutations.

### Supabase Integration
- [ ] Ensure all components fetch from Supabase — NO static/mock data allowed.
- [ ] Build missing hooks for components that currently lack DB interaction.
- [ ] Confirm RLS-safe usage (`user_id` scoped, `auth.uid()` in every row insert/update).

### Error Handling
- [ ] Wrap all async Supabase calls with try/catch and toast notifications.
- [ ] Use `<GlobalErrorBoundary />` for critical modules (analytics, dashboard, settings).

### Type Safety
- [ ] Strongly type all hooks, queries, and form fields using TypeScript interfaces and enums.

### Optimistic Updates
- [ ] Refactor mutations (create, edit, delete) to use `useOptimisticUpdate`.

## 🧱 Structural Enhancements

- [ ] Ensure all components < 500 lines — split into feature modules if needed.
- [ ] Use DRY: extract reusable modal/form/layout components.

## ✅ COMPLETE WHEN:

- [ ] Every CRUD action writes to Supabase and logs to `activity_logs`
- [ ] No component contains mock/static data
- [ ] Each form is validated, typed, RLS-safe, and shows UI feedback
- [ ] All modules have live state persisted to DB
"""

TASK.md: Deep To-Do List Based on Missing or Broken Items

1. Code Hygiene & Type Safety

1.1 Remove Debug & Placeholder ✅ COMPLETE

✅ Removed all console.log, debugger, and // TODO comments across the codebase.

✅ Enforced ESLint rule no-console and configured to fail CI on violations.

✅ Added comprehensive spell checker configuration (cspell.json) to resolve "supabase" unknown word issues.

✅ Enhanced error handling with user-friendly toast messages replacing debug output.

✅ Verified zero UI/UX changes - all functionality preserved.

1.2 Tighten Types ✅ COMPLETE

✅ Replaced all any with precise interfaces/types.

✅ Defined TS interfaces for API responses, database rows, and component props.

✅ Added utility types for common patterns (e.g., Partial<T>, Pick<T, K>).

✅ Improved type safety in hooks with proper error handling and return types.

✅ Enhanced real-time hooks with proper typing for Supabase real-time events.

2. Supabase Hook Refactor

2.1 Typed Hooks 🔄 IN PROGRESS

Create useLeads, useCustomers, useJobs, useEstimates, useInvoices, useTasks, useActivityLogs.

Move inline supabase.* calls into hooks; handle loading, error, and data states.

2.2 RLS-safe Queries

Ensure each hook uses supabase.auth.user() or has_permission() in select/insert/update.

Abstract common policy checks in hook utilities.

3. Authentication & Authorization

3.1 RBAC Implementation

Add roles, permissions, role_permissions tables in Supabase.

Implement has_permission(user_id UUID, permission TEXT) Edge Function.

Update RLS policies on all tables to use has_permission().

3.2 Frontend Enforcement

Enhance AuthContext to fetch and store user permissions.

Update ProtectedRoute and component guards to check for specific permissions.

4. Audit Logging Enhancements

4.1 Schema Changes

Extend activity_logs with old_data JSONB, new_data JSONB, changed_fields TEXT[], ip_address INET, user_agent TEXT, session_id UUID.

Create user_sessions table.

4.2 Triggers & Functions

Write PostgreSQL triggers on INSERT/UPDATE/DELETE for key tables (customers, jobs, estimates, invoices).

Update log_activity RPC to accept new fields.

4.3 UI Viewer

Update ActivityLogViewer to display field-level diffs, IP, UA, session data.

5. CI/CD Pipeline

5.1 GitHub Actions

Add workflows for:

lint: ESLint + Prettier

type-check: TS compile

test: Jest + pgTAP

build: Vite production build

Fail PRs on any step failure.

5.2 Deployment

Configure CD to deploy to Vercel/Netlify on main merge.

Use environment variables in CI secrets.

6. Testing

6.1 Unit Tests

Write Jest tests for all utility functions, hooks, and Edge Functions.

Achieve ≥80% coverage.

6.2 Integration Tests

Test Supabase Edge Functions (RPCs, triggers) with pgTAP.

Frontend-backend flows: use React Testing Library + MSW to mock API.

6.3 E2E Setup

Scaffold Cypress or Playwright suite with basic smoke tests.

7. UI/UX & Error Handling

7.1 Loading States

Add skeleton loaders to all list and detail views.

Ensure no blank screens during fetch.

7.2 Error States

Use useErrorHandler hook uniformly.

Display user-friendly messages via toast notifications.

8. Documentation

8.1 README.md

Document project setup, .env.local entries, and development commands.

8.2 API & Schema Docs

Generate ER diagram and API contract in markdown.

Publish docs in /docs folder.

9. Performance & Monitoring

9.1 Index & Query Optimization

Review slow queries; add missing indexes.

Create materialized views for heavy aggregations.

9.2 APM & Alerts

Configure Sentry for frontend & Edge Functions.

Set alert rules for error thresholds.

10. Backup & DR

10.1 Supabase Backups

Ensure PITR is enabled.

Test restore process quarterly.

10.2 Health Endpoint

Implement /health for uptime checks.
