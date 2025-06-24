# Final Roofing & Retro-Fit CRM

## Project Overview

The Final Roofing & Retro-Fit CRM is a comprehensive customer relationship management system designed specifically for roofing contractors. It streamlines lead management, customer tracking, estimate creation, job scheduling, invoicing, and payment processing—all within a secure, role-based access system with complete audit logging and optimistic UI updates for a seamless user experience.

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + TanStack Query
- **Form Handling**: React Hook Form + Zod validation
- **Testing**: Jest, React Testing Library, MSW
- **Development**: Cursor AI Pro

## Setup Instructions

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/final-roofing-crm.git
   cd final-roofing-crm
   ```

2. Copy the environment variables template and fill in your Supabase credentials
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase URL and anon key
   ```

3. Install dependencies and start the development server
   ```bash
   npm ci
   npm run dev
   ```

4. Run database migrations and seed data
   ```bash
   npm run migrate
   npm run seed
   ```

5. Run tests to verify setup
   ```bash
   npm test
   ```

## Folder Structure

- **`/src`**: Main application code
  - **`/components`**: Reusable UI components
  - **`/contexts`**: React context providers
  - **`/hooks`**: Custom React hooks for data fetching and state management
  - **`/integrations`**: Integration with external services (Supabase)
  - **`/lib`**: Utility functions and shared logic
  - **`/pages`**: Page components and routes
  - **`/types`**: TypeScript type definitions

- **`/supabase`**: Supabase configuration
  - **`/migrations`**: Database migration scripts
  - **`/storage`**: Storage bucket configurations
  - **`/tests`**: Database tests

- **`/tests`**: Frontend tests
  - **`/unit`**: Unit tests for components and hooks
  - **`/integration`**: Integration tests for workflows
  - **`/__mocks__`**: Mock data and services

## Development Workflow

1. **Development**:
   - Create a feature branch from `main`
   - Implement changes following project conventions
   - Ensure all tests pass locally
   - Submit a pull request

2. **CI/CD Pipeline**:
   - Automated checks run on every PR:
     - Linting (`npm run lint`)
     - Type checking (`npm run type-check`)
     - Unit and integration tests (`npm test`)
     - Build verification (`npm run build`)

3. **Database Migrations**:
   - Create new migrations in `supabase/migrations/`
   - Apply migrations with `npm run migrate`
   - Seed test data with `npm run seed`

4. **Deployment**:
   - Merges to `main` trigger automatic deployment
   - Production builds include optimizations and minification

## Key Features

- **Role-Based Access Control**: Secure, permission-based access to features
- **Audit Logging**: Comprehensive activity tracking with field-level change history
- **Optimistic UI Updates**: Immediate feedback with automatic rollback on errors
- **Real-time Notifications**: Instant updates when data changes
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md): Contribution guidelines
- [ARCHITECTURE.md](./ARCHITECTURE.md): System architecture and design decisions
- [PLANNING.md](./PLANNING.md): Project planning and roadmap

## License

Copyright © 2023-2024 Final Roofing & Retro-Fit. All rights reserved.
