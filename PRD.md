# Product Requirements Document (PRD): Zen Fitness Habit App

## 1. Vision and Scope
The application is a personal daily physical challenge tracker, accessible via web browser and installable on mobile devices as a PWA (Progressive Web App). The core philosophy is based on the "Minimum Viable Habit": promoting daily well-being and long-term consistency rather than extreme athletic performance. The main goal is to build a "streak" (consecutive days of training) through a static routine, rewarding total commitment while offering psychological flexibility for harder days.

## 2. User Management and Authentication
* **Target Audience:** Initially designed for personal use (Single-Tenant), but the logical data structure must support multi-tenancy for future expansions.
* **Security:** Access is protected by a credential-based authentication system (e.g., Email/Password or Magic Link). User data is private and uniquely linked to their account.

## 3. Core Functional Requirements: Routines & Exercises
The app manages a predefined daily workout program ("Groundhog Day" routine), consisting of a fixed list of exercises chosen by the user.

* **Supported Exercise Types (V1):**
  * **Counter:** Repetition-based exercises (e.g., push-ups, squats). The UI allows manual input of the achieved number or incrementing via quick buttons (+/-).
  * **Timer:** Duration-based exercises (e.g., stretching, planks). The UI includes a start/pause/reset stopwatch that automatically records elapsed seconds/minutes.
* **Extensibility:** The system must be logically designed to easily accommodate new exercise categories in the future (e.g., weightlifting with sets/reps, running with GPS distance) without breaking or altering existing types.
* **Offline-First Tracking:** The user must be able to open the app, view today's routine, and log exercises entirely offline. The system must store logs locally and automatically sync with the server once the internet connection is restored.

## 4. Rules Engine: Days and Flexibility
To prevent user frustration and app abandonment, the daily completion system is flexible and non-punitive.

* **Night-Owl Timezone:** A daily cycle does not end at rigid midnight (00:00). It has an extended tolerance threshold (e.g., 03:00 or 04:00 AM of the following day). Exercises logged at 01:00 AM belong to the previous calendar day.
* **Completion Thresholds:** Each day has two possible positive outcomes:
  * **Perfect Day (100%):** The user completes or exceeds the target values for *all* scheduled exercises.
  * **Saved Day (Minimum Threshold, e.g., 30%):** The user completes only a fraction of the program, hitting a predefined minimum threshold.

## 5. Gamification and Consistency Economy
The app uses an internal virtual economy to incentivize adherence without being overwhelming.

* **The Streak:** A counter tracks consecutive days where the user achieved at least a "Saved Day". If a day ends with zero activity (and no freezes are available), the streak resets to zero.
* **Virtual Currency (Energy Points/Coins):** Achieving a "Perfect Day" rewards the user with a fixed amount of virtual coins. A "Saved Day" maintains the streak but grants zero coins.
* **Streak Freezes:** The user can spend accumulated coins in a virtual store to purchase a "Streak Freeze" (inventory item).
* **Auto-Save Mechanism:** If the daily deadline passes and the user hasn't logged any exercises, the system checks the inventory. If a Streak Freeze is available, it is automatically consumed, the streak is maintained, and the day is marked as "Frozen".
* **Zen Visual Evolution:** Long-term consistency (e.g., total days tracked or total volume) triggers a visual progression in the UI (e.g., a growing plant, changing belt colors), which partially regresses if the streak is broken.

## 6. Statistics and Historical Analysis
The app provides visual feedback on user progress:
* **Consistency Calendar:** A monthly view coloring days based on their outcome (e.g., Dark Green = Perfect, Light Green = Saved, Blue = Frozen, Red/Empty = Failed).
* **Volume Charts:** Bar charts and/or line graphs displaying the total volume of exercises over time (e.g., "Total push-ups per week" or "Stretching minutes per month") to visualize long-term performance improvements.

## 7. Smart Push Notifications
To help build the habit, the app sends contextual, non-invasive reminders:
* **Time Profiling:** The system analyzes user habits or accepts manual input for a "preferred workout time".
* **Conditional Reminders:** If the preferred time (or a default evening time) approaches and the user hasn't reached at least a "Saved Day" threshold, a push notification is sent. If the day is already completed, the notification is strictly silenced.