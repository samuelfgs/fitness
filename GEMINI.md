# FitTrack - Project Documentation

This project uses **Yarn** as the package manager.

## Technology Stack

### Core Framework
- **Next.js 16.1.1**
- **React 19.2.0**
- **TypeScript 5**

### Backend & Database
- **Supabase**
- **Drizzle ORM 0.45.1**
- **postgres 3.4.8**

### State Management & Data Fetching
- **TanStack React Query 5.90.6**
- **React Hook Form 7.66.0**
- **Zod 4.1.12**

### UI Components
- **shadcn/ui** primitives
- **Tailwind CSS 4**
- **Lucide React**

## Project Structure
```
app/                # Next.js App Router
components/         # React Components
│   └── ui/         # Reusable UI Components
lib/                # Logic and Config
│   ├── db/         # Drizzle Schema & Migrations
│   └── supabase/   # Supabase client/server/middleware
hooks/              # Custom React Hooks
public/             # Static Assets
```

## Development Commands
- `yarn install` - Install dependencies
- `yarn dev` - Start development server
- `yarn db:generate` - Generate migrations
- `yarn db:push` - Push schema changes