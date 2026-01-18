# CLAUDE.md

This file provides guidance for AI assistants when working with code in this repository.

## Development Commands

```bash
npm run dev       # Start dev server on localhost:8080
npm run build     # Production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## Architecture Overview

CareConnect-Hub is a B2B e-health SPA for healthcare professionals (MediSync Pro). Built with React 18 + TypeScript + Vite + Tailwind CSS + shadcn-ui.

### Layered Data Flow

```
Pages (src/pages/)
    ↓
Components (src/components/)
    ↓
Data Hooks (src/hooks/data/) - React Query wrappers
    ↓
Services (src/services/supabase/) - Supabase CRUD with mock fallback
    ↓
Supabase Client (src/integrations/supabase/)
```

### Key Patterns

**Service Layer with Graceful Degradation:**
- All services in `src/services/supabase/` extend `baseService.ts`
- `executeQuery()` helper handles errors and falls back to mock data when Supabase is unavailable
- `ServiceResult<T>` tracks data source: `'supabase' | 'mock' | 'cache'`

**Type Mapping:**
- Database types (`DbPatient`, `DbAppointment`) are mapped to domain types (`Patient`, `Appointment`)
- Mapper functions: `mapDbToPatient()`, `mapDbToAppointment()`, etc.

**State Management:**
- Server state: TanStack React Query (all data hooks in `src/hooks/data/`)
- Auth state: React Context (`src/contexts/AuthContext.tsx`)
- UI preferences: localStorage (`useAgendaPreferences`)

### Main Routes

```
/                              → AgendaPage (calendar views)
/auth                          → AuthPage
/patients                      → PatientsPage
/patients/:patientId/*         → PatientDossierPage (11 nested tabs)
```

### Component Organization

- `src/components/ui/` - shadcn-ui library (48 pre-built components)
- `src/components/calendar/` - Calendar system (grid, openings, settings)
- `src/components/patients/` - Patient management & dossier tabs
- `src/components/layout/` - MainLayout, Sidebar, Header

### Backend

Supabase PostgreSQL backend:
- Config: `supabase/config.toml`
- Migrations: `supabase/migrations/`
- Edge functions: `supabase/functions/`
- Seed data: `supabase/seed.sql`

Environment variables required in `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Path Aliases

`@/*` maps to `./src/*` (configured in vite.config.ts and tsconfig.json)

## Conventions

- French locale for dates (date-fns)
- User roles: admin, practitioner, secretary, assistant, coordinator
- Appointment statuses: scheduled, waiting, in-progress, completed, absent-*, cancelled
