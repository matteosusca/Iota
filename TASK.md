# 🎯 KaizenFit - Project Task List & MVP Roadmap

Based on the provided specification documents (`PRODUCT_VISION.md`, `UI_UX.md`, `ARCHITECTURE.md`, `DATA_MODELS.md`, `DEVELOPMENT.md`, `TECHNICAL_DETAILS.md`), this document outlines the step-by-step tasks required to build the KaizenFit MVP.

---

## Phase 1: Backend Infrastructure & Database
**Goal:** Initialize the Fastify server and configure the PostgreSQL database schema.
**Context Files:** @ARCHITECTURE.md, @DATA_MODELS.md, @TECHNICAL_DETAILS.md

- [ ] **1.1 Project Setup:** Initialize Node.js + Fastify project with TypeScript.
- [ ] **1.2 Environment Variables:** Set up backend `.env` file (`DATABASE_URL`, `JWT_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `PORT`).
- [ ] **1.3 Database Schema:** Install Prisma (or Drizzle) and formulate the relational schema matching `DATA_MODELS.md` (`users`, `routines`, `daily_logs`).
- [ ] **1.4 Migrations:** Run initial migrations and ensure the database cleanly instantiates.

**Definition of Done:** Fastify server runs on the configured port, connects to PostgreSQL, and the schema successfully reflects the 3 core tables.

---

## Phase 2: Core API & Authentication
**Goal:** Implement the Anonymous JWT flow and the primary REST API endpoints.
**Context Files:** @ARCHITECTURE.md, @DATA_MODELS.md, @TECHNICAL_DETAILS.md

- [ ] **2.1 Auth Endpoint:** Implement `POST /api/v1/auth/anonymous` to receive a `deviceId` and return a JWT/User object.
- [ ] **2.2 API Middleware:** Implement JWT verification middleware for all subsequent routes.
- [ ] **2.3 Routine APIs:** Implement `GET /api/v1/routine` and `PUT /api/v1/routine`.
- [ ] **2.4 Logs APIs (LWW strategy):** Implement `GET /api/v1/logs` and `PUT /api/v1/logs/:logicalDate`. Ensure incoming logs use the "Last Write Wins" resolution on `lastUpdated`.

**Definition of Done:** All APIs can be successfully called via an HTTP client (like Postman or curl). Protected routes reject requests lacking a valid Bearer token. Logs correctly execute an upsert operation.

---

## Phase 3: Frontend Scaffold & PWA Setup
**Goal:** Create the Vue 3 application, set up Tailwind, and configure PWA capabilities.
**Context Files:** @ARCHITECTURE.md, @UI_UX.md, @PRODUCT_VISION.md, @DEVELOPMENT.md

- [ ] **3.1 Vite + Vue 3 Setup:** Scaffold the frontend following the strict `/src` structure (`components`, `stores`, `composables`, `services`, `views`).
- [ ] **3.2 Styling:** Install Tailwind CSS, configure for native dark mode (`dark:` classes), and define minimalist theme properties.
- [ ] **3.3 PWA Configuration:** Install `vite-plugin-pwa`. Configure the `manifest.webmanifest` for `display: standalone` and provide basic icons to prompt the A2HS (Add to Home Screen) banner.
- [ ] **3.4 Environment Variables:** Ensure `VITE_API_URL` and `VITE_VAPID_PUBLIC_KEY` are read correctly.

**Definition of Done:** The Vue application runs locally. Tailwind utility classes function correctly. The local dev browser surfaces a recognizable PWA manifest.

---

## Phase 4: Local Storage & State Management
**Goal:** Implement the offline-first IndexedDB layer and Pinia state management.
**Context Files:** @DATA_MODELS.md, @ARCHITECTURE.md, @TECHNICAL_DETAILS.md, @DEVELOPMENT.md

- [ ] **4.1 Time Math Service:** Create a service utility to calculate the `logicalDate` (adjusting local device time backwards by 4 hours for the 04:00 AM reset).
- [ ] **4.2 IndexedDB Wrapper:** Use `idb` or `localforage` to set up client-side tables for the routine and current logs.
- [ ] **4.3 Pinia Stores:** Create `useRoutineStore` and `useLogStore`. Implement local saving logic directly into the IndexedDB wrapper upon state mutability.

**Definition of Done:** Vue components can read/write routine data to the Pinia stores. On page refresh, the stores successfully hydrate their state entirely from the local IndexedDB.

---

## Phase 5: Client Sync Engine
**Goal:** Bridge the local frontend to the Fastify backend using optimistic synchronization.
**Context Files:** @ARCHITECTURE.md, @DATA_MODELS.md, @TECHNICAL_DETAILS.md

- [ ] **5.1 API Client Layer:** Create `api.service.ts` to manage all outgoing Axios/Fetch calls with the JWT injected into the header.
- [ ] **5.2 Authentication Initialization:** On first launch, detect missing JWT, automatically hit the backend logic, store the JWT, and save the anonymous user profile.
- [ ] **5.3 Optimistic Sync Logic:** When Pinia detects a change (e.g., +1 added to counter), instantly update local DB, then asynchronously trigger the `.PUT` API.
- [ ] **5.4 Offline Queue (V1):** If the async `.PUT` fails due to network error, cache the intent and retry it on the next app launch or page reload.

**Definition of Done:** Actions in the UI update immediately. Inspecting network tabs shows accurate payloads sent to the Fastify backend in the background. Disabling network, clicking a button, then enabling network and reloading resolves the LWW correctly on the server.

---

## Phase 6: Core UI Development (Views)
**Goal:** Construct the 4 main application pages according to the `UI_UX.md` restrictions.
**Context Files:** @UI_UX.md, @PRODUCT_VISION.md, @DEVELOPMENT.md

- [ ] **6.1 Onboarding (Page 1):** Create the minimalist setup form for initializing the first `UserRoutine` and trigger the PWA prompt on completion.
- [ ] **6.2 Settings (Page 4):** Create the minimalist editor allowing target edits (future logs only) and implement basic JSON Export/Import buttons.
- [ ] **6.3 Dashboard Timeline (Page 2):** Render the 4x7 grid reflecting the last 28 logical days, calculating block colors (Green, Yellow, Red, Gray) based on percentage targets.
- [ ] **6.4 Dashboard Workout Cards (Page 2):** Build the task cards based on `type: 'counter' | 'timer'`. Wire up the `+1` actions to the store.

**Definition of Done:** A user can walk through onboarding, see their dashboard with daily targets, view a 28-day streak timeline, and use the settings interface. 

---

## Phase 7: Focus Mode Timer
**Goal:** Implement the distinct, immersive timer screen for duration-based exercises.
**Context Files:** @UI_UX.md, @ARCHITECTURE.md

- [ ] **7.1 Timer Overlay (Page 3):** Build a full-screen, distration-free view with large typography.
- [ ] **7.2 Background Visibility:** Use VueUse's `useDocumentVisibility` to track browser state. If the user tabs out or locks their phone, the timer MUST pause automatically.
- [ ] **7.3 Integration:** Wire the "Finish/Save" logic appropriately so the accumulated seconds parse into the progress tracking, and close the overlay.

**Definition of Done:** Clicking play on a timer task opens the overlay. Alt-tabbing pauses the timer accurately. Saving the timer correctly attributes the time logged for the specific exercise block back to the dashboard state.

---

## Phase 8: Push Notification system
**Goal:** Implement the automated server-side reminders based on the user's progress.
**Context Files:** @ARCHITECTURE.md, @DATA_MODELS.md, @PRODUCT_VISION.md

- [ ] **8.1 Client Subscription:** Onboarding should gracefully request Notifications via browser native dialog. Generate a `PushSubscription` and `POST /api/v1/notifications/subscribe`.
- [ ] **8.2 Backend Storage:** Store the VAPID subscription object to the PostgreSQL `users` table upon retrieval.
- [ ] **8.3 Notification Cron Job:** Set up `node-cron` on the Fastify server. Query for users with incomplete logical days (< 50%) at critical times, and dispatch web pushes using the `web-push` library.

**Definition of Done:** A fresh device registers the service worker successfully. The Node backend can be forcefully triggered to dispatch a push notification to that active device with a sample alert.

---

## Phase 9: Polish & Verification
**Goal:** Ensure the app feels "Ultra-Low Friction" and meets requirements.
**Context Files:** @PRODUCT_VISION.md, @UI_UX.md

- [ ] **9.1 Streak Calculation Review:** Verify the strict arithmetic for 'Completed', 'Saved', 'Failed' behaves predictably up against edge-case targets.
- [ ] **9.2 Performance Check:** Ensure zero blocking operations on page load.
- [ ] **9.3 Aesthetic Verification:** Confirm the design matches premium aesthetics via Tailwind dark implementation. No complex unrequired UI animations.

**Definition of Done:** Comprehensive end-to-end user flow confirmed working flawlessly without internet connection, and synchronizing gracefully with the backend without collisions.
