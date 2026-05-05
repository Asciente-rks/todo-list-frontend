# To-Do List

> A multi-user todo system with a native mobile app — sign up, sign in, and manage tasks from your phone with cloud sync.

A two-table cloud-synced todo app: Express + Sequelize + MySQL backend deployed on Render, Expo / React Native mobile client distributed as an Android APK via EAS Build. Cold-start resilient (2-minute timeouts, friendly wake-up notice) so the Render free tier doesn't surface as a confusing error.

The system spans **two repositories**:

| Repository | What it is | Stack |
|---|---|---|
| [`todo-list`](https://github.com/Asciente-rks/todo-list) | REST API backend | Express 5 + Sequelize + MySQL + JWT |
| [`todo-list-frontend`](https://github.com/Asciente-rks/todo-list-frontend) | Mobile + web client | **Expo / React Native** (Android, iOS, web) |

---

## Live Demo

- **🪪 Live API:** [todo-list-backend-4li8.onrender.com/api](https://todo-list-backend-4li8.onrender.com/api)
- **📱 Android APK:** Build via EAS or download from [GitHub Releases](https://github.com/Asciente-rks/todo-list-frontend/releases)
- **⏳ Cold start:** Render free tier puts the backend to sleep after 15 min idle — first request takes ~30-60 s; the mobile app shows a friendly "Waking up the server" notice during that window.

---

## Table of Contents

1. [What It Does](#what-it-does)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Database Design](#database-design)
5. [Repository Layout](#repository-layout)
6. [API Reference](#api-reference)
7. [Authentication & Credentials](#authentication--credentials)
8. [Deployment](#deployment)
9. [Cost Breakdown](#cost-breakdown)
10. [Local Development](#local-development)
11. [Author](#author)

---

## What It Does

- **Register** with username, email, and password (bcrypt-hashed).
- **Sign in** to get a JWT, persisted in `AsyncStorage` on the device.
- **Create todos** with title, description, optional due date.
- **Toggle completed**, edit, and delete — all changes sync to the server.
- **Per-user data** — each user only sees and can mutate their own todos (FK-enforced).
- **Native mobile app** — Android, iOS, and web from a single Expo codebase.
- **Friendly cold-start UX** — when the backend is sleeping (Render free tier), the app shows a "Waking up the server" banner instead of a generic spinner.

---

## Architecture

```
┌────────────────────────────────────────┐
│ Mobile / Web (Expo)                    │
│  • React Native + TypeScript           │
│  • Expo SDK 54 + RN 0.81               │
│  • AsyncStorage (token, userId)        │
│  • Custom fetch wrapper:               │
│    - 2-min AbortController timeout     │
│    - JWT auto-attach                   │
│    - retry wrapper for cold-start      │
└──────────────────┬─────────────────────┘
                   │ HTTPS + JWT (Bearer)
                   │
                   ▼
┌────────────────────────────────────────┐
│ Express 5 backend (Render Web Service) │
│  • CORS: origin "*"                    │
│  • express.json                        │
│  • request logging middleware          │
│  • /, /api, /health liveness routes    │
│  • /api/users/* + /api/todos/*         │
│  • 404 + global error handler          │
└──────────────────┬─────────────────────┘
                   │ Sequelize 6 (mysql2 driver)
                   │
                   ▼
┌────────────────────────────────────────┐
│ MySQL (free-tier provider)             │
│  • users + todos tables                │
│  • indexed FK on todos.userId          │
└────────────────────────────────────────┘

      ▲
      │
EAS Build ──► Android APK + iOS + web
                (preview / production profiles)
```

**Notable architectural choices:**

- **Render free tier for the backend** — sleeps after 15 min idle. The mobile app handles this gracefully: 2-minute request timeout (covers cold start) + `WakeUpNotice` banner + retry wrapper.
- **JWT in AsyncStorage** — works the same on Android, iOS, and web. No platform-specific secure storage needed at this scale.
- **Single-flag auth state** in `App.tsx` — `isAuthenticated` + `isRegistering` toggle which screen renders. No navigation library; keeps the bundle small.
- **Centralized fetch wrapper** with annotated errors — 4xx responses get a `.status` field so callers can branch on validation (no scary red logs) vs network failure.

---

## Tech Stack

### Backend (`todo-list`)

| Layer | Technology | Why |
|-------|-----------|-----|
| Runtime | Node.js + TypeScript 5 | Standard, broad host support |
| Framework | **Express 5** | Stable, familiar |
| ORM | Sequelize 6 | Models + associations + sync in one |
| Database | **MySQL** via `mysql2` | Free-tier providers abundant |
| Auth | JWT + bcrypt | Stateless, standard |
| Validation | Yup | Tiny, ergonomic |
| Dev | `ts-node-dev` (`--respawn --transpile-only --poll`) | Fast restart |
| Hosting | **Render Web Service** (default branch: `master`) | Free tier, auto-deploy on push |

### Frontend (`todo-list-frontend`)

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | **Expo SDK 54** + React Native 0.81 + React 19 | One codebase → Android, iOS, web |
| Language | TypeScript 5 | Type safety across screens + API |
| Storage | `@react-native-async-storage/async-storage` | Cross-platform persistent token store |
| Date pickers | `@react-native-community/datetimepicker` | Native UI on each platform |
| Icons | `lucide-react-native` | Consistent SVG icons |
| HTTP | Plain `fetch` wrapper (`src/api/client.ts`) | 2-min `AbortController`, JWT auto-attach |
| Build | **EAS Build** (`eas.json`) | Cloud builds for Android APK/AAB + iOS |

---

## Database Design

Two tables. Both keyed by UUID v4. The relationship is a simple 1-to-many (one user → many todos).

### `users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | UUIDv4 |
| `username` | VARCHAR | unique |
| `email` | VARCHAR | unique |
| `password` | VARCHAR | bcrypt hash |
| `createdAt` / `updatedAt` | DATETIME | Sequelize-managed |

### `todos`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | UUIDv4 |
| `title` | VARCHAR | not null |
| `description` | VARCHAR | optional |
| `completed` | BOOLEAN | default false |
| `dueDate` | DATETIME | nullable |
| `userId` | UUID (FK → users.id) | **indexed** |
| `createdAt` / `updatedAt` | DATETIME | Sequelize-managed |

**Notable design choices:**

- **`todos.userId` is indexed explicitly** (`indexes: [{ fields: ["userId"] }]`) so per-user list queries hit the index and stay fast as the table grows.
- **No migrations** — schema is created/updated by `sequelize.sync()` on server startup. For production-grade evolution, layer in `sequelize-cli` migrations.
- **`mysql2` driver** instead of `pg` — broader free-tier MySQL support than free-tier Postgres.

---

## Repository Layout

### Backend

```
todo-list/
├── package.json                       # Express 5, Sequelize, JWT, bcrypt, yup
├── tsconfig.json
└── src/
    ├── server.ts                      # CORS, JSON, request logging,
    │                                  # /api/users + /api/todos mounts,
    │                                  # /health probe, 404 + error handler
    ├── associations/
    │   └── associations.ts            # User.hasMany(Todo) + Todo.belongsTo(User)
    ├── models/
    │   ├── users/user.sequelize.ts    # id, username, email, password
    │   └── todo/todo.sequelize.ts     # id, title, description, completed,
    │                                  # dueDate, userId
    ├── controllers/                   # Per-resource controllers
    ├── services/                      # Business logic
    ├── repositories/                  # Sequelize query layer
    ├── routes/
    │   ├── users/user.routes.ts       # /api/users/*  (incl. /login, /register)
    │   └── todo/todo.routes.ts        # /api/todos/*
    ├── middlewares/                   # auth + validation
    ├── dtos/                          # Request/response shapes
    └── utils/                         # db.ts, helpers
```

### Frontend (Expo)

```
todo-list-frontend/
├── package.json                       # Expo 54, RN 0.81, React 19
├── app.json                           # Expo app config (icons, package, EAS projectId)
├── eas.json                           # EAS Build profiles (preview APK + production)
├── tsconfig.json
├── index.ts                           # registerRootComponent(App)
├── App.tsx                            # Auth gate → Login / Register / TodoScreen
├── assets/                            # icon.png, splash, adaptive-icon, favicon
└── src/
    ├── api/
    │   ├── client.ts                  # fetch wrapper, 2-min timeout, JWT injector
    │   ├── retryWrapper.ts            # Retry logic for cold-starts
    │   ├── authService.ts             # /api/users/login + /register
    │   ├── todoService.ts             # /api/todos CRUD
    │   └── userService.ts
    ├── assets/                        # Icon GIFs (add, check-mark, to-do, trash)
    ├── components/
    │   ├── TodoInput.tsx
    │   ├── TodoItem.tsx
    │   └── WakeUpNotice.tsx           # "Server waking up" banner
    ├── screens/
    │   ├── LoginScreen.tsx
    │   ├── RegisterScreen.tsx
    │   └── TodoScreen.tsx             # Main list + actions (~26KB)
    ├── theme.ts                       # Colors / spacing tokens
    └── types/
        └── todo.ts
```

---

## API Reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/` | none | Plain text liveness ("Server is alive") |
| `GET` | `/api` | none | JSON liveness (`{ status: "online", message: ... }`) |
| `GET` | `/health` | none | JSON health probe (`{ status: "UP", service, timestamp }`) |
| `POST` | `/api/users/register` | none | Create a user — bcrypt-hash password, return JWT |
| `POST` | `/api/users/login` | none | Verify credentials → return JWT |
| `GET` / `PUT` / `DELETE` | `/api/users/:id` | JWT | Profile CRUD |
| `GET` | `/api/todos` | JWT | List todos for the authenticated user |
| `POST` | `/api/todos` | JWT | Create a new todo |
| `PATCH` / `PUT` | `/api/todos/:id` | JWT | Update title / description / completed / dueDate |
| `DELETE` | `/api/todos/:id` | JWT | Delete a todo |

CORS is wide open (`origin: "*"`) since the client is a mobile app, not a same-origin web page. Every request is logged with `[ISO-timestamp] METHOD URL` for Render's log explorer; unhandled paths fall through to a structured 404 + global error handler.

---

## Authentication & Credentials

This system has **no seeded accounts** — register through the signup flow.

### Self-registration

1. Open the app (Expo Go or installed APK).
2. Tap **Register**.
3. Enter username, email, password.
4. Tap **Sign Up** — receive a JWT, get logged in automatically.

### Sign-in flow

1. Tap **Sign In**.
2. Enter email + password.
3. JWT stored in `AsyncStorage` (`token` key) + `userId`.
4. Token persists across app restarts; `App.tsx` clears stale tokens on initial mount and re-routes to Login.

### Why no seed?

The backend is a personal scratchpad and changes frequently — seeded accounts would constantly drift. Single-user behaviour is well-tested via fresh registrations.

---

## Deployment

### Backend → Render Web Service

The production backend lives at **`https://todo-list-backend-4li8.onrender.com/api`**.

To deploy your own:

1. Create a Render Web Service pointing at this repo, branch **`master`**.
2. Set build command `npm install && npm run build`, start command `npm start`.
3. Provision a MySQL database (free providers: Aiven, FreeSQLDatabase, Filess.io, Render's own Postgres if you migrate).
4. Set the environment variables listed below.
5. Render auto-deploys on every push to `master`.

The `Cache-Control: no-store` header on `/health` plus the `/` and `/api` liveness routes are designed to keep Render's health checks happy.

### Frontend → Expo Application Services (EAS)

```bash
cd todo-list-frontend
npm install
npx eas build --platform android --profile preview      # APK for sideloading
npx eas build --platform android --profile production   # AAB for Play Store
npx eas build --platform ios --profile production       # iOS build
```

EAS profiles in `eas.json`:

- **development** — Expo dev client, internal distribution.
- **preview** — APK for direct install / internal testing.
- **production** — release builds with `EXPO_PUBLIC_API_URL` baked in.

EAS project ID: `64c99027-1e5b-4869-9ba5-ff08d77c8258`.

Distribute the resulting APK however you like — direct download link, GitHub Releases, or Play Store internal track.

---

## Cost Breakdown

> **Designed for $0/month forever.** Mobile distribution + always-online backend + database, all on free tiers.

| Service | Free tier | We use | Headroom |
|---------|-----------|--------|----------|
| **Render Web Service** | 750 hours/mo, sleeps after 15 min | always-on under monitoring | within limits |
| **MySQL** (Aiven / FreeSQLDatabase / Filess.io) | 5 GB / 1 GB depending on provider | <50 MB | **95%+** |
| **EAS Build (Expo)** | 30 builds/mo on free | <5 builds/mo | **80%+** |
| **GitHub Releases** (APK distribution) | unlimited public assets | <50 MB total | unlimited |
| **GitHub Actions** (public repo) | unlimited minutes | n/a | unlimited |
| **Apple Developer Program** | n/a (paid $99/yr for App Store) | not used (sideload only) | — |

**Total: $0/month** — including mobile distribution.

**Why each free tier was chosen:**

- **Render over a long-running VPS** — auto-deploys on push, free SSL, free tier includes managed Postgres or external MySQL via env vars.
- **Expo over bare React Native** — managed builds, OTA updates, single codebase for Android + iOS + web.
- **APK sideload over Play Store** — Play Store costs $25 once + ongoing review overhead. Sideload is free, fine for portfolio + internal testing.
- **2-min client timeout** — Render's free-tier cold start can take 30-60 s; padding to 2 min covers worst-case wake-up cleanly.

### Cold-start handling (the not-so-secret sauce)

The mobile app handles Render's free-tier sleep gracefully:

1. **2-minute `AbortController` timeout** in `client.ts` — generous enough to wait out a cold start.
2. **`WakeUpNotice` component** — shows a friendly "Waking up the server, this may take a minute" banner instead of a generic spinner.
3. **`retryWrapper.ts`** — wraps the fetch wrapper with bounded retries on transient network failures (without retrying on 4xx validation errors).

For paying tiers / always-on hosting, none of this is needed — the same code just makes requests faster.

---

## Local Development

### Backend

```bash
git clone https://github.com/Asciente-rks/todo-list.git
cd todo-list
npm install

# Provision local MySQL with a database matching your .env
npm run dev    # ts-node-dev with --respawn --transpile-only on src/server.ts
```

Server listens on `process.env.PORT` (Render injects this) or `10000` by default.

### Frontend (mobile dev)

```bash
git clone https://github.com/Asciente-rks/todo-list-frontend.git
cd todo-list-frontend
npm install

npm start        # Expo dev server with QR code
npm run android  # Android emulator / connected device
npm run ios      # iOS simulator (macOS only)
npm run web      # Web preview
```

Either install **Expo Go** on your phone and scan the QR code, or use a connected emulator. Set `EXPO_PUBLIC_API_URL_PLAIN` in `app.json` (or via EAS secrets) to point at your local backend (`http://<your-LAN-ip>:10000/api`) when developing.

### Environment Variables

**Backend** (`.env`):

```env
PORT=10000
NODE_ENV=development

# MySQL
DB_HOST=...
DB_PORT=3306
DB_NAME=todo_list
DB_USER=...
DB_PASSWORD=...

# Auth
JWT_SECRET=...
JWT_EXPIRES_IN=7d
```

**Frontend** (`app.json` extra OR `eas.json` env):

```json
"extra": {
  "EXPO_PUBLIC_API_URL_PLAIN": "https://todo-list-backend-4li8.onrender.com/api"
}
```

For EAS builds, set per profile in `eas.json`:

```json
"production": {
  "env": {
    "EXPO_PUBLIC_API_URL": "https://todo-list-backend-4li8.onrender.com/api"
  }
}
```

---

## Author

Built by **Ralph Kenneth F. Sonio** ([@Asciente-rks](https://github.com/Asciente-rks)). The Android app lives at package id `com.ascienterks.todolisttsfrontend`; production builds are distributed via EAS.
