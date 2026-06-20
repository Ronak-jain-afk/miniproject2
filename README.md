# Attendance Management System

A full-stack MERN attendance tracking application with role-based access, analytics, and reporting.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript + SWC |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB with Mongoose |
| Auth | JWT (access 15m + refresh 7d) + bcrypt |
| Validation | Zod (full-stack) |
| Charts | Recharts |
| Reports | PDF (pdfkit), CSV, Excel |

## Setup

```bash
# Prerequisites: Node.js 18+, Docker

# Clone and install
cd attendance-system
npm install --prefix server
npm install --prefix client

# Start MongoDB
docker compose up -d

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your values

# Seed admin account
npm run seed --prefix server

# Start development
npm run dev
```

Both server (port 5000) and client (port 5173) start concurrently.

## Default Admin

- **Email:** `admin@attendance.edu`
- **Password:** `Admin@123`

## Project Structure

```
attendance-system/
├── server/          # Express API (14 feature modules)
│   ├── src/
│   │   ├── config/       # env, db, constants
│   │   ├── middleware/    # auth, rbac, validate, error handler
│   │   ├── modules/      # auth, users, departments, courses, semesters,
│   │   │                 # subjects, sections, students, faculty,
│   │   │                 # attendance, analytics, reports, rules
│   │   ├── shared/       # Zod schemas, enums, types
│   │   ├── utils/        # pagination, helpers
│   │   └── jobs/         # cron scheduler
│   └── tests/
├── client/          # React SPA
│   ├── src/
│   │   ├── components/   # shadcn UI components
│   │   ├── layouts/      # Admin, Faculty, Student layouts
│   │   ├── pages/        # feature-based pages
│   │   ├── hooks/        # custom React Query hooks
│   │   ├── lib/          # API client, utils
│   │   ├── stores/       # Auth context
│   │   └── router/       # Routes + guards
│   └── tests/
└── docker-compose.yml
```

## Features

- **Authentication:** JWT with refresh token rotation, account lockout, password policy
- **RBAC:** Three roles — Admin, Faculty, Student — with guarded routes and endpoints
- **Academic Structure:** Departments, Courses, Semesters, Subjects, Sections (soft-delete)
- **Student & Faculty Management:** CRUD, search, bulk import, status tracking
- **Attendance Marking:** Session-based, bulk upsert, click-to-toggle grid, quick actions
- **Attendance Rules Engine:** Configurable thresholds, session freeze periods, consecutive absence detection, scheduled jobs
- **Analytics Dashboards:** Admin (institution-wide), Faculty (class-wise trends), Student (personal summary) with Recharts
- **Reports:** Student, subject, and defaulter PDF reports

## API Endpoints

60+ RESTful endpoints across 14 modules. All list endpoints return paginated responses with `{ data, pagination }`. All mutations validated with Zod.
