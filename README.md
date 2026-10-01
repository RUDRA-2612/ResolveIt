# 🎓 Resolvelt

**Resolvelt** is a centralized, next-generation Grievance Addressal System built specifically for college and hostel environments. It aims to replace informal and scattered complaint channels (like WhatsApp groups, verbal complaints, or paper forms) with a structured, transparent, and highly accountable platform.

## 🚀 Key Features

- **Exclusive Access**: Secure login restricted strictly to official college Microsoft accounts (OAuth).
- **Smart Duplicate Detection**: Real-time AI checks based on location and category to prevent duplicate tickets and encourage upvoting on existing issues.
- **Community Feed**: A subreddit-style public feed to browse, upvote, and comment on open campus issues categorized by departments (Hostel, Mess, IT, etc.).
- **Live Camera Verification**: Proof uploads are restricted to the live camera to prevent fake or AI-generated grievance images.
- **Auto-Escalation & Timers**: Each ticket carries a strict deadline timer. If unresolved by Level 1 authorities, the issue automatically escalates to Level 2 supervisors.
- **Accountability Score**: Authority dashboards display their average resolution times and escalation rates to ensure maximum efficiency and transparency.

## 💻 Technology Stack

- **Frontend & Routing**: SvelteKit, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL
- **Backend ORM**: Drizzle ORM, pg driver
- **Icons**: Lucide-Svelte

## 👥 Role Hierarchy

1. **Non-Authority (Students/Staff)**: Can report issues, upvote, comment, and confirm resolutions.
2. **Level 1 Handlers**: Wardens, Mess In-charge, IT Support (First responders).
3. **Level 2 Supervisors**: Chief Warden, Transport Officer (Auto-escalation handlers).
4. **Level 3 Top Authority**: Dean, Registrar (Final oversight).
5. **System Admin**: Manages categories, deadlines, and authority mappings.

---
*Built as a comprehensive DBMS Project.*
