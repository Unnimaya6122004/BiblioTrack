# Library Management System (LMS)

Full-stack Library Management System with role-based dashboards for Admin and Member users.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router
- Backend: Spring Boot 3, Java 17, Spring Security (JWT), Spring Data JPA, Flyway
- Database: PostgreSQL
- Deployment: Render (backend + Postgres), Vercel (frontend)

## Monorepo Structure

```text
.
├── backend/                  # Spring Boot API
│   ├── src/main/java/...
│   ├── src/main/resources/application.properties
│   ├── Dockerfile
│   └── pom.xml
└── frontend/
    └── lms-frontend/         # React + Vite app
        ├── src/
        ├── package.json
        └── vercel.json
```

## Features

- Admin portal:
  - Dashboard analytics
  - Users, Books, Book Copies
  - Loans, Reservations, Fines
  - Notifications
- Member portal:
  - Dashboard
  - Browse books
  - My loans/reservations/fines
  - Notifications
- JWT-based authentication + role-based route protection
- Flyway database migrations

## Prerequisites

- Java 17+
- Node.js 18+ and npm
- PostgreSQL 14+

## Local Development

### 1) Backend

```bash
cd backend
cp .env .env.local  # optional backup
./mvnw spring-boot:run
```

Backend runs on port from `SERVER_PORT` (default `8080`).

### 2) Frontend

```bash
cd frontend/lms-frontend
npm install
npm run dev
```

Vite proxy defaults to `http://localhost:8081`.  
If backend runs on `8080`, either:

- run backend on 8081, or
- set frontend env before running dev:

```bash
VITE_PROXY_TARGET=http://localhost:8080 npm run dev
```

## Default Dev Credentials

Seed users are enabled in backend config for development:

- Admin: `admin@lms.local` / `Admin@123`
- Member: `member@lms.local` / `Member@123`

Change these before any public/demo usage.

## Environment Variables

### Backend (Render / production)

Required:

```env
SERVER_PORT=10000
JWT_SECRET=replace_with_long_random_secret
DB_URL=jdbc:postgresql://<host>:5432
DB_NAME=<database_name>
DB_USERNAME=<db_user>
DB_PASSWORD=<db_password>
```

## Deployment

### A) Backend on Render

1. Create Render Postgres.
2. Create Render Web Service from this repo:
   - Runtime: `Docker`
   - Root Directory: `backend`
   - Dockerfile Path: `Dockerfile`
   - Region: same as Postgres
3. Add backend env vars (above).
4. Set Health Check Path: `/v3/api-docs`.
5. Deploy and verify:
   - `https://<backend-service>.onrender.com/v3/api-docs`

### B) Frontend on Vercel

1. Import this GitHub repo in Vercel.
2. Set Root Directory:
   - `frontend/lms-frontend`
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy.

This repo already includes `frontend/lms-frontend/vercel.json` with:
- API proxy `/api/*` -> Render backend
- SPA fallback routing for page refreshes

## API Docs

- OpenAPI JSON: `/v3/api-docs`
- Swagger UI: `/swagger-ui/index.html`

Example:

- `https://<backend-service>.onrender.com/v3/api-docs`
- `https://<backend-service>.onrender.com/swagger-ui/index.html`

## Troubleshooting

- `404 NOT_FOUND` on page refresh in Vercel:
  - Ensure Vercel Root Directory is `frontend/lms-frontend`
  - Ensure `vercel.json` is present in that directory
- Login works locally but fails in production:
  - Verify Vercel proxy destination points to correct Render backend URL
- Backend starts but DB errors:
  - Recheck `DB_URL`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`
- Cold start delay on Render Free:
  - First request may take ~30-60 seconds after inactivity

## Security Notes

- Do not commit real production secrets.
- Rotate DB/JWT secrets if shared publicly.
- Replace default seeded credentials for non-local use.

## License

Add your preferred license (MIT/Apache-2.0/etc.) in a `LICENSE` file.
