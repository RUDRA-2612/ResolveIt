# Resolvelt

A centralized College and Hostel Grievance Addressal System for JKLU.

## Project Overview
**Resolvelt** is designed to streamline the reporting and resolution of issues within the campus and hostels. It provides a structured flow from the student reporting a problem to the final authority resolving it.

### Core Features
- **Official Login:** Exclusive access via JKLU Microsoft Email (OAuth).
- **Report a Problem First:** The primary action is front and center to ensure immediate grievance reporting.
- **AI Duplicate Checks:** Prevents spam by analyzing the location and category of newly reported tickets against existing ones.
- **Auto-Escalation:** Integrated countdown timers for tickets. If a ticket isn't acknowledged or resolved in time, it automatically escalates to the next level of authority.
- **Role-Based Dashboards:** Separate experiences for Reporters (Students/Staff) and Handlers/Supervisors (Wardens, IT, Deans).

## Tech Stack (Frontend-Only Architecture)
We are building the frontend as a highly responsive, modern Single Page Application (SPA) with a focus on premium aesthetics (glassmorphism, micro-animations, and fluid UIs).

- **Core Framework:** React 18
- **Bundler:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components & Icons:** shadcn/ui & Lucide-React
- **Animations:** Framer Motion
- **Routing:** React Router v6

## Development
Currently in the initial setup phase. To run the project locally once initialized:
```bash
npm install
npm run dev
```
