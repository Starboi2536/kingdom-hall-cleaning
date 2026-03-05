# 🏛️ Kingdom Hall Cleaning System

A multi-tenant web application for managing Kingdom Hall cleaning schedules, supplies inventory, and volunteer coordination — built for the Jehovah's Witnesses congregation community in Cape Town, South Africa.

**Live Demo:** [https://kingdom-hall-cleaning.vercel.app](https://kingdom-hall-cleaning.vercel.app)

---

## 🔐 Demo Login Credentials

Use these accounts to explore the system without creating your own:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | `adminex@gmail.com` | `adminhall1` | Full access — manage tasks, users, settings |
| **Overseer** | `member@gmail.com` | `memberhall` | Areas, supplies, settings |
| **Volunteer** | `member2@gmail.com` | `member2hall` | Areas and settings only |


---

## 📋 Overview

The Kingdom Hall Cleaning System replaces paper-based cleaning checklists with a real-time digital platform. Multiple congregations (halls) share one deployment — each hall's data is completely isolated from others via Row Level Security.

### The Problem It Solves
- Cleaning coordinators had no visibility into which tasks were completed
- Volunteers had no shared checklist — work was duplicated or missed
- Supply levels were tracked manually on paper
- No way to manage multiple halls from a single system

### The Solution
A progressive web app that volunteers install on their phones, tick off cleaning tasks, and submit — with changes reflected instantly on every other device in the hall.

---

## ✨ Features

### Role-Based Access Control
Four roles with a strict hierarchy:

- **Super Admin** — creates and manages all Kingdom Halls across the system
- **Admin** — manages tasks, areas, users, and settings for their hall
- **Overseer** — manages supplies and can view all areas
- **Volunteer** — completes cleaning tasks

### Multi-Tenant Architecture
- Complete data isolation between halls using `hall_id` scoping on every table
- Supabase Row Level Security (RLS) policies enforce isolation at the database level
- A single deployment serves unlimited halls with zero data leakage

### Real-Time Task Completion
- Volunteers tick tasks and click **Mark Area Complete** to submit
- All devices in the hall see updates in real time via Supabase WebSocket subscriptions
- Shared checklist model — any volunteer's submission is visible to all hall members

### Supply Management
- Track current stock levels against minimum thresholds
- Low stock alerts on dashboard and supplies page
- Mobile-optimised card layout for easy stock adjustments on phone

### Progressive Web App (PWA)
- Installable on Android and iOS without an App Store
- Launches fullscreen with no browser chrome
- Works offline for cached pages

### Dashboard
- Live task completion count and percentage for the day
- Area-by-area progress bars
- Low stock summary
- Timezone-aware date calculations (SAST UTC+2)

### User Management
- Admins create, delete, and reset passwords for hall members
- All users can change their own password via Settings
- Super Admin accounts are hidden from and protected against admin actions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.3.6 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Real-time | Supabase WebSocket Subscriptions |
| ORM | Supabase JS Client with RLS |
| Deployment | Vercel |
| PWA | next-pwa |
| Icons | Lucide React |

---

## 🗄️ Database Schema

```
halls
  id, name, location, created_at

profiles
  id, full_name, role, hall_id, created_at
  role: VOLUNTEER | OVERSEER | ADMIN | SUPER_ADMIN

areas
  id, name, description, hall_id

tasks
  id, name, area_id, hall_id, sort_order

task_completions
  id, task_id, hall_id, user_email, completed_at

supplies
  id, name, category, current_stock, min_stock, unit, hall_id
```

---

## 🔒 Security Architecture

### Row Level Security
Every table has RLS policies scoped to `hall_id`. Users can only read and write data belonging to their own hall. A `security definer` function `get_my_hall_id()` looks up the user's hall from their profile, preventing RLS circular dependency issues.

```sql
create policy "select own hall" on tasks
  for select using (hall_id = get_my_hall_id());
```

### Admin Client Pattern
Privileged server-side operations (task completions, user creation) use the Supabase service role key via `createSupabaseAdminClient()`. Authentication is always verified via `getUser()` before any privileged operation — the admin client bypasses RLS safely because the server controls it, not the client.

### Role Hierarchy Enforcement
`requireRole()` uses numeric levels to enforce minimum access:

```typescript
const levels = { VOLUNTEER: 1, OVERSEER: 2, ADMIN: 3, SUPER_ADMIN: 4 }
```

A page requiring `OVERSEER` access automatically grants `ADMIN` and `SUPER_ADMIN` too.

### Middleware Protection
Every route is protected by `middleware.ts` which checks the Supabase session before serving any page. Unauthenticated users are redirected to `/login` instantly.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- A Vercel account (for deployment)

### Local Development

```bash
# Clone the repository
git clone https://github.com/Starboi2536/kingdom-hall-cleaning.git
cd kingdom-hall-cleaning

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

```bash
# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Setup

Run the following in your Supabase SQL Editor to set up the schema and RLS policies:

```sql
-- Enable RLS on all tables
alter table halls enable row level security;
alter table profiles enable row level security;
alter table areas enable row level security;
alter table tasks enable row level security;
alter table task_completions enable row level security;
alter table supplies enable row level security;

-- Hall ID lookup function (security definer prevents RLS loops)
create or replace function get_my_hall_id()
returns uuid language sql security definer stable as $$
  select hall_id from profiles where id = auth.uid() limit 1;
$$;
```

### Deployment

```bash
# Push to GitHub
git add .
git commit -m "Initial deployment"
git push

# Deploy on Vercel
# 1. Connect your GitHub repo on vercel.com
# 2. Add the three environment variables
# 3. Deploy
```

After deploying, update your Supabase **Authentication → URL Configuration**:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/**`

---

## 📁 Project Structure

```
kh-cleaning/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── areas/page.tsx        # Cleaning areas + task lists
│   ├── supplies/page.tsx     # Supply management
│   ├── users/page.tsx        # User management (Admin+)
│   ├── settings/page.tsx     # Task editor + password change
│   ├── super-admin/page.tsx  # Hall management (Super Admin)
│   ├── login/page.tsx        # Authentication
│   └── api/complete/         # Task completion API route
├── components/
│   ├── TaskList.tsx           # Interactive task checklist with real-time sync
│   ├── StockAdjuster.tsx      # Supply stock +/- controls
│   ├── Sidebar.tsx            # Navigation with role-based links
│   ├── TaskEditor.tsx         # Inline task editing
│   ├── AddTaskForm.tsx        # Add tasks to areas
│   ├── AddSupplyForm.tsx      # Add new supplies
│   ├── CreateHallForm.tsx     # Super Admin hall creation
│   └── ChangePasswordForm.tsx # Password update form
├── lib/
│   ├── get-user.ts            # Server-side user + role resolution
│   ├── require-role.ts        # Role-based route protection
│   ├── supabase-server.ts     # Server + admin Supabase clients
│   └── supabase-browser.ts   # Browser Supabase client (real-time)
├── middleware.ts              # Auth guard for all routes
├── next.config.ts             # Next.js + PWA configuration
└── public/
    ├── manifest.json          # PWA manifest
    ├── icon-192.png           # PWA icons
    └── icon-512.png
```

---

## 🏗️ Architecture Decisions

### Shared Checklist Model
Tasks completed by any volunteer are visible to all users in the hall. `user_email` is stored for audit trail but not used for display filtering. This enables true team collaboration.


### Batch Submit Pattern
Rather than saving each checkbox tap to the database instantly, volunteers tick all tasks in an area and click **Mark Area Complete**. This single API call prevents race conditions, reduces database writes, and gives a clear UX confirmation moment.

### Hall Override Cookie (Super Admin)
Super Admin can view any hall's data by setting a `super_admin_hall_override` cookie. `getUser()` reads this cookie and substitutes the overridden `hallId` into the user object. Since all queries use `user.hallId`, the entire app context switches with one cookie.

---

## 👨‍💻 Author

**Jonathan Malunga**
Full-Stack Developer · Cape Town, South Africa

- GitHub: [@Starboi2536](https://github.com/Starboi2536)
- LinkedIn: [jonathan-malunga](https://www.linkedin.com/in/jonathan-malunga-27b411230/)
- Email: malungaj94@gmail.com

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
