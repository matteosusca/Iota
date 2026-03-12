# Architectural Guidelines & System Constraints
**Project:** Zen Fitness Habit App
**Target Audience for this document:** AI Coding Agents (Google Antigravity)

## 1. Core Architectural Principles
All generated code must strictly adhere to the following software engineering principles:
* **KISS (Keep It Simple, Stupid):** Avoid overengineering. Do not introduce message queues (e.g., RabbitMQ, BullMQ) or microservices. 
* **SOC (Separation of Concerns) & SRP (Single Responsibility Principle):** Strict separation between routing, input validation, business logic, and data access.
* **Open/Closed Principle:** The system must be designed to allow the addition of new Exercise Types (e.g., weightlifting, running) by *adding* new code (new validators, new UI components) without *modifying* the existing database schema or core routing logic.

## 2. Technology Stack
* **Language:** Strict TypeScript across the entire stack.
* **Infrastructure:** Docker Compose + Traefik (Reverse Proxy for automatic Let's Encrypt SSL/HTTPS).
* **Database:** PostgreSQL.
* **ORM:** Prisma ORM.
* **Backend:** Node.js + Express.js.
* **Scheduled Tasks:** `node-cron` (used within the Node instance for Push Notification triggers and midnight streak calculations).
* **Frontend:** Vue 3 (Composition API) + Vite (with vite-plugin-pwa) + TailwindCSS.
* **State Management:** Pinia.

## 3. Database Architecture & The "JSONB Rule"
To satisfy the Open/Closed Principle for exercises, the database uses a hybrid approach.
* Relational columns (`user_id`, `date`, `exercise_id`, `status`) must be used for enforcing data integrity and calculating statistics/streaks.
* **CRITICAL CONSTRAINT - The JSONB Rule:** The `daily_logs` table MUST use a `JSONB` column (e.g., named `metrics` or `payload`) to store the actual completion data of an exercise. 
    * *Example Counter:* `{ "reps": 50 }`
    * *Example Timer:* `{ "seconds_elapsed": 300 }`
    * *Future Weightlifting:* `{ "sets": 3, "reps": 10, "weight_kg": 50 }`
* Do NOT create specific relational columns for reps, time, or weights in the `daily_logs` table.

## 4. Backend Layered Architecture (Express.js)
The backend code must be strictly divided into the following layers. Never mix these responsibilities:
1.  **Routes (`/routes`):** Only maps HTTP methods and URLs to Controllers.
2.  **Controllers (`/controllers`):** Only handles HTTP request/response formatting and basic I/O validation. **No business logic is allowed here.**
3.  **Services (`/services`):** The core of the application. Contains the business logic (e.g., calculating if a day is "Perfect" or "Saved", managing the Virtual Currency, consuming Streak Freezes).
4.  **Strategy Pattern for Exercises:** Use a Strategy Pattern in the service/validation layer to handle different exercise `types` (`counter`, `timer`). When a new exercise type is added, the agent should only need to create a new strategy file.
5.  **Data Access (`/repositories` or Prisma client):** Direct database interactions.

## 5. Frontend Architecture (Vue 3)
* **Offline-First:** The app is a PWA. Pinia stores must handle data locally first. Use Optimistic UI updates (update the UI immediately on click, then sync with the backend). Implement a queue system in the frontend to retry failed API calls when the network is restored.
* **Dynamic Components:** The UI must render exercise inputs dynamically based on the exercise `type` fetched from the backend, using Vue's `<component :is="...">` feature. 
    * `type: 'counter'` renders `<CounterInput />`
    * `type: 'timer'` renders `<TimerInput />`
* **Styling:** Use pure TailwindCSS utility classes. Keep the UI "Zen", clean, and minimalist.

## 6. Implementation Workflow for Agents
When instructed to build a feature, agents MUST:
1.  Read this `ARCHITECTURE.md` file.
2.  Generate a plan/Artifact explaining how the feature fits into these specific layers.
3.  Wait for user approval before generating the actual code.