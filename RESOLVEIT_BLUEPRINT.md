# RESOLVEIT - PROJECT BLUEPRINT

## 1. Project Overview
**Name:** ResolveIt
**Description:** A centralized College and Hostel Grievance Addressal System for JKLU.
**Status:** Planning phase complete. Awaiting final command to start codebase setup.

## 2. Technology Stack (Finalized)
- **Framework:** SvelteKit (Using only Frontend capabilities for now)
- **Styling:** Tailwind CSS v4 (Zero-config, fast)
- **Language:** TypeScript
- **Icons:** Lucide-Svelte
- **Future Backend:** PostgreSQL, Drizzle ORM, pg driver (Node.js)

## 3. Core Modifications & Rules
- **Login:** Must use **JKLU Official Microsoft Email** (OAuth). No standard OTP/email login.
- **Home Page Priority:** The absolute first and most prominent option on the home screen will be **"Report a Problem"**. Clicking it opens a dedicated detailed window/screen.
- **Removed Features:** No "Anonymous Reporting" and no "Gamification/Badges".
- **Added Value:** Live Camera ONLY for image uploads (no gallery), AI Duplicate check based on category + location, and Auto-Escalation Countdown Timers.

## 4. Role Hierarchy (To be updated later)
- **Level 0 (Reporter):** Students, Teachers, Staff.
- **Level 1 (Handler):** Warden, Mess In-charge, IT Support (First responders).
- **Level 2 (Supervisor):** Chief Warden, Transport Officer (Auto-escalation recipients).
- **Level 3 (Top Authority):** Dean, Registrar.
- **Admin:** System Management.

## 5. User Journeys

### Non-Authority (Student/Staff) Journey
1. **Login:** JKLU Microsoft Email. First-time setup asks for Role, Dept, and Room.
2. **Dashboard:** "Report a Problem" is the primary action. Below it, a subreddit-style feed of public tickets (Top/New/Pending).
3. **Reporting Flow:** Select Category, Location (Dropdown), Title, Description, take Live Photo. 
4. **AI Check:** System checks for duplicates based on location/category to prevent spam.
5. **Tracking:** Ticket goes to 'My Tickets' thread. Push notifications on status changes.
6. **Resolution:** When resolved, user gets a prompt to Confirm (Problem Solved) or Reopen (Challenge).

### Authority Journey
1. **Dashboard:** Private dashboard showing only assigned tickets with **Countdown Timers**.
2. **Acknowledge:** Mark as acknowledged to stop the countdown timer.
3. **Update:** Post progress in the ticket thread (tagged as staff).
4. **Auto-Escalation:** If the timer hits zero, the ticket auto-routes to Level 2.
5. **Resolve:** Upload proof photo and mark resolved.

## 6. Next Steps (Action Items for Next Session)
1. Initialize SvelteKit using: `npx sv create . --template minimal --types ts --add tailwindcss="plugins:none"`
2. Set up routing structure (`/login`, `/dashboard`, `/authority-dashboard`).
3. Build the Home Screen UI with the prioritized "Report a Problem" flow.
