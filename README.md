# 🏥 AIMS Salipur — Digital Campus & EdTech Platform

> **Odisha's Premier Nursing Coaching Academy**  
> High-performance Next.js 14 digital campus, student admissions funnel, learning management system (LMS), and administrative operating system.

---

## 🌟 Overview

**AIMS Salipur** is a unified digital platform built for nursing academy operations, student acquisition, and course delivery. It combines public-facing admissions channels with multi-role management for students, instructors, accountants, and administrators.

### Core Portals & Capabilities
- **🎓 Student LMS**: Access syllabus-aligned video lectures, live class sessions, test prep materials, and attendance tracking.
- **👨‍🏫 Instructor Hub**: Course builder, lesson sequencing, YouTube/Cloudinary resource integration, and live class scheduling.
- **💰 Accountant Portal**: Fee collection tracking, student billing ledger, transaction receipts, and financial summaries.
- **🛡️ Admin Operations**: User role assignment, enrollment approvals, batch management, and system-wide controls.
- **🚀 High-Converting Landing Page**: Responsive modern UI with GSAP animations, course discovery, and direct WhatsApp counseling integration.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Radix UI primitives
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth, Storage)
- **Animations**: [GSAP](https://greensock.com/gsap/) & [Tailwind Animate](https://github.com/jamiebuilds/tailwindcss-animate)
- **Media & Assets**: [Cloudinary](https://cloudinary.com/)
- **Charts & Metrics**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.17.0 or higher
- **npm** / **yarn** / **pnpm**
- A [Supabase](https://supabase.com) project

### 2. Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/aimssalipur/aims.git
cd aims

# Install dependencies
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env.local` and add your project credentials:

```bash
cp .env.example .env.local
```

Fill in your Supabase project keys in `.env.local`:
```env
# Browser-safe (public)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key

# Server-only (never expose to frontend)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# Database Connection (optional for migrations)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

> **Note**: Never commit `.env` or `.env.local` files to version control. They are strictly protected by `.gitignore`.

### 4. Database Setup

Apply the SQL migration scripts in order from the `supabase/migrations/` directory to your Supabase SQL editor or via Supabase CLI:
1. `20260811000000_create_profiles.sql`
2. `20260813000000_multi_role_and_live_classes.sql`
3. `20260824000000_add_approved_to_profiles.sql`
4. `20260828000000_add_accountant_and_finance_tables.sql`

### 5. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📂 Project Structure

```text
aims/
├── public/                 # Static assets and icons
├── src/
│   ├── app/                # Next.js App Router (pages & API routes)
│   │   ├── (auth)/         # Authentication flows (login, register)
│   │   ├── accountant/     # Accountant dashboard & fee management
│   │   ├── admin/          # Admin dashboard & user controls
│   │   ├── api/            # Backend API routes
│   │   ├── courses/        # Course catalog & detail views
│   │   ├── dashboard/      # Student dashboard & class viewer
│   │   └── instructor/     # Instructor workspace & course creator
│   ├── components/         # Reusable UI components
│   └── lib/                # Supabase clients, utilities, and helpers
├── supabase/
│   └── migrations/         # PostgreSQL schema & RLS migrations
├── .env.example            # Sample environment variables template
├── .gitignore              # Git ignore rules for secrets and build artifacts
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies & scripts
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

---

## 🔒 Security Best Practices

- All database access is protected by Supabase Row-Level Security (RLS) policies.
- Role-based middleware enforces access control between Student, Instructor, Accountant, and Admin portals.
- Private environment variables (`SUPABASE_SERVICE_ROLE_KEY`) are restricted to server-side executions.

---

## 📄 License & Maintainer

Maintained for **AIMS Salipur**. All rights reserved.
