# 🌌 Iota - Minimalist Habit Tracker

> **Status: Personal Beta Project**
> Iota is a personal experiment in building a high-performance, local-first habit tracker. It is currently in a beta state and is designed for self-hosting.

Iota is a Progressive Web App (PWA) focused on ultra-low friction micro-interactions and Duolingo-style gamification. It is built to help you maintain streaks and stay consistent with your daily routines.

---

## 🎯 What is Iota?

Iota is designed for users who want a **zero-friction** way to track their progress. It prioritizes immediate action and clear visual feedback over complex data entry.

### 🚀 Key Features
- **Local-First & Optimistic Sync**: Your data is stored locally in your browser (`IndexedDB`) for instant performance, then synced to your private backend in the background.
- **The Logical Day**: Iota resets your day at **04:00 AM** local time. This aligns with most people's sleep patterns, ensuring your streak doesn't break if you finish your routine after midnight.
- **Volume-Based Streaks**: Streaks aren't just binary. 
  - **100% Volume**: Increases your streak 🔥
  - **>= 50% Volume**: Freezes your streak (forgiveness) ❄️
  - **< 50% Volume**: Resets your streak 📉
- **Zero-Friction Onboarding**: No complex sign-up forms. Iota uses anonymous device authentication to get you started instantly.
- **Push Notifications**: Gentle reminders to keep your streak alive (VAPID-based PWA notifications).

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Vue 3 (Composition API) + Vite
- **State Management:** Pinia
- **Styling:** Tailwind CSS (Native Dark Mode)
- **Persistence:** IndexedDB (`idb` library)
- **PWA:** `vite-plugin-pwa`

### Backend
- **Framework:** Fastify (Node.js)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Security:** JWT (JSON Web Tokens)
- **Automation:** `node-cron` for push notification scheduling

---

## 💻 Developer Guide

### 1. Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (v20+ recommended)

### 2. Local Setup
Clone the repository and run the development environment:

```bash
# Start the development database
docker-compose -f docker-compose.dev.yml up -d

# Install backend dependencies
cd backend
npm install
npx prisma migrate dev

# Start backend dev server
npm run dev

# In another terminal, start frontend
cd ../frontend
npm install
npm run dev
```

### 3. Testing
Iota uses `Vitest` for both frontend and backend testing.
```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

---

## 🚢 Deployment Guide

Iota is optimized for self-hosting on platforms like **Portainer** and **Nginx Proxy Manager**.

### 1. Environment Variables
You will need to configure the following variables in your `docker-compose.yml` or your hosting provider:

| Variable | Description |
|----------|-------------|
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | Database name (e.g., `iota`) |
| `CORS_ORIGIN` | The URL where your frontend will be hosted |
| `JWT_SECRET` | A strong, random string for auth tokens |
| `FRONTEND_PORT` | The port exposed for the frontend service (default: 8080) |

### 2. Launching the Stack
Simply run the following command in the root directory:
```bash
docker-compose up -d --build
```

### 3. Nginx Configuration
If using Nginx Proxy Manager, point your domain to the `FRONTEND_PORT` assigned above. Ensure **Cache Assets** and **Block Common Exploits** are enabled for the best experience.

---

## 📜 Project Scope & Status

Iota is a **personal, non-commercial project**. 
- **Beta Status**: While functional, you may encounter bugs. Data migrations between beta versions are not guaranteed.
- **Scope**: The current focus is on a single, core daily routine. We avoid "feature creep" to keep the experience as minimalist as possible.

---

*Built with focus and intent. Stay consistent.*
