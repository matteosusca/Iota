# ⚙️ KaizenFit - Technical Details & Implementation Constraints

## 1. Environment Variables (.env)
The agent must ensure that sensitive information is never hardcoded. 

### Frontend (.env)
- `VITE_API_URL`: The base URL for the backend API.
- `VITE_VAPID_PUBLIC_KEY`: Used for Web Push subscription.

### Backend (.env)
- `DATABASE_URL`: Connection string for PostgreSQL.
- `JWT_SECRET`: Secret key for signing and verifying tokens.
- `VAPID_PUBLIC_KEY` & `VAPID_PRIVATE_KEY`: Keys for the Web Push protocol.
- `PORT`: Server port (default: 3000).

## 2. Time Management & Timezones
- **Storage:** All timestamps in the database and JSON logs must be stored in **UTC**.
- **Calculation:** The "Logical Day" (04:00 AM reset) must be calculated based on the **User's Local Timezone**.
- **Logic:**
  - Let `now` be the current local time.
  - Let `logicalNow` be `now - 4 hours`.
  - The `logicalDate` is the `YYYY-MM-DD` representation of `logicalNow`.
- **Consistency:** Ensure the frontend and backend use the same logic to identify the current `logicalDate`.

## 3. Synchronization & Conflict Resolution
- **Strategy:** "Last Write Wins" (LWW).
- **Frontend Logic:** - Every update to a `DailyLog` or `UserRoutine` updates a `lastUpdated` timestamp.
  - When syncing, the record with the most recent `lastUpdated` timestamp overwrites the other.
- **Optimistic UI:** The UI must update immediately and save to `IndexedDB` before the network request is even attempted.

## 4. Security & Authentication
- **Anonymous Login:** The `deviceId` should be a randomly generated UUID stored in the browser's `localStorage`.
- **JWT:** Tokens should have a long expiration (e.g., 1 year) to keep the user "logged in" indefinitely as long as they don't clear their browser data.
- **API Protection:** All endpoints except `POST /auth/anonymous` must verify the JWT in the `Authorization` header.

## 5. PWA Requirements
- **Service Worker:** Must handle offline caching of assets (HTML, JS, CSS) and provide basic "Offline Mode" detection.
- **Manifest:** Must include `display: standalone`, high-quality icons, and a theme color matching the UI's Zen aesthetic.
- **Background Sync:** (Optional for V1) Use the Background Sync API if available, otherwise retry failed requests on the next app startup.