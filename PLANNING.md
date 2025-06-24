## Project Architecture Overview

This CRM system is built using:

- **React + TypeScript** frontend (Vite-powered)
- **Tailwind CSS** for styling
- **Supabase** as backend (auth, DB, storage)
- **Modular folder structure** with dialog-based CRUD components
- **Optimistic UI updates** and basic error handling present in some modules

## Key Goals for Enterprise Readiness

1. Replace all static/mock data with Supabase-powered live queries.
2. Ensure all forms use react-hook-form with validation, error handling, and controlled inputs.
3. Apply full type-safety in every component, especially forms and Supabase hooks.
4. Build out missing functionality (e.g., modals with no logic or save triggers).
5. Implement comprehensive RLS-based Supabase policies and data logging.
6. Extend current UI with robust but invisible backend logic: automation, audit logging, and secure workflows.
7. Backend-first: validate all schema alignment, FK relationships, and test coverage.
8. All frontend functionality must persist to Supabase and respect RLS.
"""
PLANNING.md: Master System Architecture & Enterprise Checklist

1. System Architecture Overview

Frontend

React + TypeScript + Vite

State & Data Fetching: TanStack Query, React Hook Form

Component Library: Shadcn UI + Tailwind CSS

Routing: React Router DOM

Error Handling: GlobalErrorBoundary, CriticalErrorBoundary

Backend (Supabase)

Database: PostgreSQL with RLS policies

Auth: Supabase Auth (Email/Password, MFA, SSO)

Storage: Supabase Storage + external cloud (AWS S3)

Realtime: Supabase Realtime for live updates

Edge Functions: Node.js for business logic & external integrations

Scheduled Jobs: Supabase Cron for data retention, KPI calculations

CI/CD & DevOps

Version Control: GitHub

CI: GitHub Actions (lint, types, tests, build)

CD: Deploy to hosting (Vercel/Netlify) on merge to main

Environment: .env.local for local dev, secrets encrypted in CI

Logging & Monitoring

Frontend & Edge Functions: Sentry DSNs

Structured Logs: Logtail or Datadog

Metrics: Supabase Analytics + custom SQL views

External Integrations

Email: SendGrid / Mailgun

SMS: Twilio

Accounting: QuickBooks Online / Xero

Calendar: Google Calendar API / Microsoft Graph

Payment: Stripe (Publishable & Secret keys)

Geocoding: Google Maps / Mapbox (optional)

AI/ML: OpenAI API (optional for sentiment / OCR)

Testing

Unit/Integration: Jest, React Testing Library, pgTAP (for SQL)

E2E: Cypress or Playwright

Performance: k6, Apache JMeter

Security: OWASP ZAP, penetration tests

2. Enterprise-Ready Checklist

Code Quality & Architecture



Security & Compliance



Automation & Workflow



Analytics & Reporting



Performance & Scalability



DevOps & Monitoring



Accessibility & UX



Documentation & Onboarding

## Vision
Deliver a production-grade, visually premium, and fully responsive CRM tailored for contractors — beginning with Final Roofing & Retro-Fit — with no visual/UX changes from the existing layout. The CRM must achieve enterprise-grade resilience, automation, integration, and security.

## Tech Stack
- Frontend: React + TypeScript
- State: TanStack Query + Context
- Auth: Supabase Auth
- Database: Supabase (PostgreSQL) with RLS
- Storage: Supabase Storage
- Deployment: Vercel (assumed)
- AI Development Tool: Cursor AI Pro
- Testing: Vitest/React Testing Library (frontend), Pytest (backend)

## Architecture
- Modular folders: /customers, /leads, /jobs, /tasks, /settings, /invoices, /estimates, /components, /hooks
- Context-based data sharing
- Custom hooks for all data fetches/mutations (e.g., useCustomer, useLead, useEstimate)
- API interactions wrapped in Supabase clients with optimistic updates and error boundaries
- Role-based routing separation for client vs admin panels

## Development Phases
1. Backend Model Completion: Schema/logic + RLS + triggers
2. Core Feature Completion: All CRUD + workflows + integrations
3. Testing & QA: Full unit, integration, and regression suite
4. Final Polish: PWA, security, exports, mobile optimization

## User Roles
- Admin: Full access
- Sales: Leads, estimates, conversions
- Project Manager: Jobs, tasks, schedules
- Accountant: Invoices, payments, reports
- Field Crew: Mobile access, photo upload, job status
- Client: Portal view only

## Component Contract
Every module (jobs, invoices, etc.) must:
- Persist data via Supabase (no local state-only behavior)
- Apply correct RLS policies
- Trigger `activity_logs`
- Include dark/light mode toggle
- Include test files: unit, edge, validation, RLS
- Use optimistic updates with fallback

## Success Metrics
- 100% test coverage on core components
- Zero mock data or static elements
- Full Supabase-backed persistence
- Mobile responsive and ARIA-compliant
- Dark/light mode on all screens
- All listed tasks in TASK.md completed
"""
