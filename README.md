# EventsPlug 🔌

EventsPlug is a self-hostable event management and registration platform. It enables organizations to publish customized event directory hubs and embed dynamic, high-performance registration widgets on any website.

Built as a TypeScript monorepo, the platform is structured for modularity, code sharing, and rapid development.

---

## 🏗️ Project Architecture

This monorepo is managed by `pnpm` and built with `turborepo`. It separates logic into shared core libraries (`packages`) and deployable targets (`apps`).

### 📱 Applications (`/apps`)
* **[backend](file:///Users/alen/Code/EventsPlug/apps/backend)**: A NestJS REST API using Prisma ORM to interface with a PostgreSQL database. Manages authentication, event organization profiles, custom registration schemas, and sign-ups.
* **[dashboard](file:///Users/alen/Code/EventsPlug/apps/dashboard)**: A Next.js portal where organizations manage their portal profile, customize event designs, invite members, and export registration CSV sheets. Includes the public event hub views.
* **[widget](file:///Users/alen/Code/EventsPlug/apps/widget)**: A vanilla TypeScript Web Component (`event-widget`) compiled with Vite. It dynamically renders the interactive registration interface on any webpage.

### 📦 Packages (`/packages`)
* **[types](file:///Users/alen/Code/EventsPlug/packages/types)**: Core TypeScript types, interfaces, and enums shared across the frontend, backend, and widget.
* **[validators](file:///Users/alen/Code/EventsPlug/packages/validators)**: A unified validation library (`validateForm`) that enforces form rules (required checks, email verification, numbers, select options) on both the client (widget) and server (NestJS API).
* **[templates](file:///Users/alen/Code/EventsPlug/packages/templates)**: Predefined event form presets (Individual, Team, Esports Tournament, Workshop, Hackathon) that copy into the database on event creation.
* **[react](file:///Users/alen/Code/EventsPlug/packages/react)**: A React wrapper component (`EventsWidget`) to safely embed the custom widget inside Next.js or React applications without SSR hydration errors.

---

## 🛠️ Technology Stack

* **Language**: TypeScript
* **Monorepo Tooling**: [turborepo](https://turbo.build/) & [pnpm](https://pnpm.io/)
* **Backend**: [NestJS](https://nestjs.com/) & [Prisma ORM](https://www.prisma.io/)
* **Dashboard / Public Hub**: [Next.js](https://nextjs.org/) & [TailwindCSS](https://tailwindcss.com/)
* **Widget Engine**: [Vite](https://vite.dev/) & Vanilla Web Components (Shadow DOM)

---

## 🚀 Getting Started

### 📋 Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v18+)
* [pnpm](https://pnpm.io/) (v10+)
* PostgreSQL (Running locally or via Docker)

### 1. Installation
Install workspace dependencies from the root directory:
```bash
pnpm install
```

### 2. Environment Configuration
Copy the environment template files in the root and configure your values (such as database URLs and JWT secrets):
```bash
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
```

### 3. Database Migration & Seed
Initialize the PostgreSQL schema and populate the database with default themes, dummy organizations, and sample events:
```bash
# Generate Prisma Client & apply schema migrations
pnpm --filter backend exec prisma db push

# Seed the database
pnpm --filter backend exec prisma db seed
```

### 4. Running the Development Server
Start all applications and watch for package compiles concurrently:
```bash
pnpm dev
```
* **Dashboard Hub**: `http://localhost:3000`
* **API Backend**: `http://localhost:5001`
* **Widget Sandbox**: `http://localhost:5173`

---

## 🎨 Core Customizations & Features

### 🌟 Unified Validators
Forms are validated by `@eventflow/validators` dynamically using the database field mappings. It verifies data integrity before database submissions on the backend, and handles immediate UI error alerts client-side in the widget shadow DOM.

### 🌓 Synced Themes & Backdrops
The public-facing organization directory page and individual event registration pages automatically share brand styling. Users can toggle between **Light/Dark modes** seamlessly, and the pages load matching dynamic backdrops (`DOT_MATRIX`, `GRID_WARP`, `AURORA_GLOW`) based on organization settings.
