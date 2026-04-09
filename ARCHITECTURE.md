# 🏗️ KaizenFit - System Architecture & Tech Stack

## 1. System Overview
KaizenFit operates on a **Local-First, Optimistic Sync** architecture. The frontend acts as the primary source of truth for the user's immediate interactions, while a lightweight custom backend handles cross-device synchronization, data backup, and the push notification engine.

## 2. Frontend Stack
* **Core Framework:** Vue 3 (using Composition API & `<script setup>`) + Vite.
* **Styling:** Tailwind CSS (utilizing native `dark:` classes for system dark mode support).
* **State Management:** Pinia.
* **Utilities:** VueUse (`@vueuse/core`), specifically for `useDocumentVisibility` to handle timer pausing when the app is backgrounded.
* **Local Storage:** IndexedDB (wrapped with `idb` or `localforage` for Promise-based interaction).

## 3. Backend Stack
* **Runtime:** Node.js with TypeScript.
* **Web Framework:** Fastify (for speed and native JSON schema validation).
* **Database:** PostgreSQL.
* **ORM:** Prisma (or Drizzle ORM).
* **Notifications:** `web-push` library for VAPID protocol, `node-cron` for scheduling the "Risk of losing streak" notifications.

## 4. Core Architectural Patterns

### A. Separation of Concerns (Frontend)
The `/src` directory must strictly isolate responsibilities:
1. `components/`: Pure UI components (Tailwind + Vue). They receive `props`, emit `events`, and have NO knowledge of databases or API calls.
2. `stores/` (Pinia): Holds the current state in memory (`useRoutineStore`, `useLogStore`). Reacts to UI events.
3. `composables/`: Reusable Vue logic (e.g., `useWorkoutTimer` for managing background-safe intervals).
4. `services/`: Pure TypeScript files handling Math/Logic, IndexedDB interactions, and Axios/Fetch API calls. No Vue imports allowed here.

### B. Optimistic UI & Synchronization
1. User taps "+1" on an exercise.
2. The UI updates instantly.
3. The Store updates the Local `IndexedDB`.
4. A background service silently triggers a `PUT /api/v1/logs/:logicalDate` call to the backend.
5. If the network fails, the request is queued locally and retried on the next app launch or network reconnection.

### C. Zero-Friction Authentication
* The app relies on **Anonymous JWT Authentication**.
* On first launch, the frontend generates a unique `deviceId` (UUID).
* It calls `POST /api/v1/auth/anonymous`.
* The backend returns a JWT, which the frontend stores and attaches as a Bearer token to all subsequent API calls. No user input required.

### D. Push Notification Flow
* PWA requests notification permissions via the browser.
* Browser generates a `PushSubscription` object.
* Frontend sends this object to the backend to be stored against the user's profile.
* A server-side Cron Job runs periodically (e.g., hourly), querying the DB for users who are < 50% complete for the current Logical Day, and sends a push notification payload.