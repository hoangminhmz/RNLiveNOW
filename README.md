# DentalFlow MVP

A real-time dental clinic room status and patient workflow management system.

## Features
- **Scheduled List**: View and manage upcoming appointments.
- **Waiting Area**: Real-time tracking of arrived patients with live counters.
- **Rooms Board**: Drag & drop patients from waiting area to treatment rooms.
- **Timeline View**: Daily visualization of room occupancy and treatment durations.
- **Real-time Updates**: Instant UI synchronization across all clients via WebSockets.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, dnd-kit, Socket.io-client, Day.js
- **Backend**: Node.js, Express, Socket.io, Prisma ORM
- **Database**: SQLite (via better-sqlite3)

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   npx tsx scripts/seed.ts
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Environment Variables
- `DATABASE_URL`: Prisma connection string (default: `file:./dev.db`)
- `GEMINI_API_KEY`: Required for AI features (if any)
- `APP_URL`: Base URL of the application

## Docker Setup
A `docker-compose.yml` is provided for containerized deployment.
```bash
docker-compose up --build
```
