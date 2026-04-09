# 🎯 KaizenFit - Product Vision & MVP Scope

## 1. Product Overview
KaizenFit is a Progressive Web App (PWA) designed to help users build and maintain daily habits through Duolingo-style gamification, ultra-low friction micro-interactions, and targeted push notifications. 
The core psychological driver of the app is the **Streak** (a continuous chain of successful days). The system is designed to be forgiving for those who try, but ruthless to those who quit.

## 2. Core Philosophy: "Ultra-Low Friction"
- **Zero-Click Insight:** Upon opening the app, the user must instantly see their current status, timeline, and daily tasks without needing to navigate or click.
- **Immediate Action:** Logging an exercise (e.g., adding +1 push-up) must require a maximum of one tap.
- **Zero-Friction Onboarding:** No email, no password, no complex setups for the first launch.

## 3. Core Mechanics & Business Logic

### The Mathematical Streak System (Volume-Based)
Exercises are either `counter` (repetitions) or `timer` (duration). The daily goal is converted into a global "Total Volume" percentage (0% to 100%).
* **100% Completion (Victory):** The user completes all exercises. The Streak increases by `+1`.
* **>= 50% Completion (Saved/Frozen):** The user completes at least half of the total volume. The Streak is *frozen* (does not increase, but is not lost).
* **< 50% Completion (Failed):** The Streak resets to `0`.

### The Logical Day
* The day does NOT reset at midnight (00:00).
* The "Logical Day" resets at **04:00 AM**. 
* *Example:* An exercise completed at 02:30 AM on Oct 25th counts towards the Oct 24th daily log.

### Historical Immutability (Snapshots)
* When a day is logged, the current routine (exercise names, targets) is saved as a **Snapshot** within that day's log.
* If the user changes their routine target tomorrow, past days are NOT recalculated. Past data is immutable.

## 4. MVP (V1) Scope & Boundaries
* **In Scope:** Static daily routine (same exercises every day), anonymous device-based tracking, local-first data saving, PWA install prompt (A2HS), server-side push notifications.
* **Out of Scope:** Email/password registration, social features/leaderboards, complex weekly schedules (e.g., "Leg day on Monday"), complex UI animations.