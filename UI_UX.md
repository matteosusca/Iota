# 🎨 KaizenFit - UI/UX Design System & Page Routing

## 1. Core Design Rules
* **Framework:** Tailwind CSS exclusively. Do NOT write custom `.css` files unless absolutely necessary.
* **Theme:** Native dark mode using Tailwind's `dark:` classes. Keep colors muted and "Zen".
* **Animations:** Use minimal Vue `<Transition>` components. No complex 3D or heavy JS animations. A simple border color change or opacity fade is enough.
* **Interactions:** Buttons must be large and thumb-friendly. 

## 2. Page Specifications

### Page 1: Onboarding (Seen only on Day 0)
* **Goal:** Create the initial routine in under 30 seconds.
* **UI Elements:**
    * Clean Header: "Don't break the chain."
    * Minimalist Form: Input for exercise Name, Dropdown for Type (Counter/Timer), Input for Target.
    * "+ Add another exercise" ghost button.
    * Massive Primary Button: "Start my Streak".
* **UX Flow:** Upon clicking Start, immediately prompt the browser's "Add to Home Screen" (A2HS) native banner.

### Page 2: Dashboard / Home (The Core App)
* **Rule:** 0-clicks to understand current status.
* **Section A: The Streak (Top)**
    * Large Typography showing the current streak (e.g., "🔥 12 Days"). 
* **Section B: The Timeline (Below Streak)**
    * A minimal grid (4 rows x 7 columns) showing the last 28 days.
    * *Colors:* Gray (Empty/Future), Dark Gray/Faded Red (Failed, <50%), Yellow/Orange (Saved, 50-99%), Solid Green (Completed, 100%).
* **Section C: Today's Workout (Center)**
    * Global Progress Bar (with a visible marker at the 50% threshold).
    * **Counter Cards:** Shows Name and `0 / Target`. Includes giant `+1` and `-1` buttons on the card.
    * **Timer Cards:** Shows Name and `00:00 / Target`. Includes a giant "Play" button.
* **Visual Feedback:** When a card reaches its target, change the border to green and lower the text opacity slightly.
* **Bottom Navbar:** Two icons only -> "Home" and "Settings".

### Page 3: Timer Overlay (Focus Mode)
* **Trigger:** Pressing "Play" on a Timer Card.
* **UI Elements:** Takes over the screen to prevent distraction. Dark/Zen background. Giant ticking clock.
* **Controls:** "Pause" and "Finish/Save".
* **UX Flow:** If the browser fires `visibilitychange` (user leaves the app), the timer MUST automatically pause and save the elapsed seconds.

### Page 4: Settings (Minimalist)
* **UI Elements:**
    * List of current routine exercises with ability to edit targets (modifications only affect *today* and *future*, never past logs).
    * Data Management Section: "Export Data" (Download JSON) and "Import Data".