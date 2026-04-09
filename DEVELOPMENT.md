# 💻 KaizenFit - Development Guidelines & AI Rules

## 1. Coding Principles
* **KISS (Keep It Simple, Stupid):** Do not over-engineer. If a feature is not explicitly in `PRODUCT_VISION.md`, do not build it.
* **SRP (Single Responsibility Principle):** A component should only handle UI. A composable should only handle specific logic. A service should only handle data fetching/math.
* **DRY (Don't Repeat Yourself):** Extract reusable logic (like logical date calculation) into the `services/` directory.
* *Exception to DRY:* The `DailyLog` intentionally copies data from `UserRoutine` to create an immutable snapshot. This is by design.

## 2. Directory Structure Restrictions (`/src`)
Do not deviate from this strict separation of concerns:
* `/components`: Vue SFCs (`.vue`). UI only. Emits events, receives props. NO API calls.
* `/views` or `/pages`: The 3 main routing pages assembling the components.
* `/stores`: Pinia (`.ts`). Holds global state (`useRoutineStore`, `useLogStore`).
* `/composables`: Vue logic (`.ts`). Example: `useWorkoutTimer.ts` handling `visibilitychange` events.
* `/services`: Pure TypeScript (`.ts`). Examples: `api.service.ts` (Axios/Fetch), `math.service.ts` (Volume calculation), `storage.service.ts` (IndexedDB wrapper). 

## 3. Vue 3 Specific Rules
* Use standard `<script setup lang="ts">`.
* Prefer `ref` over `reactive` for primitive values to avoid reactivity loss.
* Always use TypeScript interfaces for Props.

## 4. AI Agent Instructions (CRITICAL)
When reading this file, the AI agent must adhere to the following rules:
1.  **Micro-Tasking:** Only execute the exact task requested in the user prompt. Do NOT proactively modify files or build features that were not explicitly asked for.
2.  **Context Boundary:** Rely ONLY on the provided `.md` context files. Do not invent standard app features if they contradict KaizenFit's specific rules (e.g., do not add a "Login" screen).
3.  **No Placeholders:** Write complete, production-ready code for the specific component requested. Do not leave `// TODO: implement this later` unless instructed.