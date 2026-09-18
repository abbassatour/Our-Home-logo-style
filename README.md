
# Our Home — Engineering & Contracting Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](<https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?logo=supabase>)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Private-red)]()

A modern, responsive, full-stack architectural and engineering web platform designed for **Our Home** (Masyaf, Syria). The platform serves as a customer-facing showcase for projects, architectural services, internships, and the proprietary **Post-Allocation Savings Contract** ("عقد لاحق التخصص"), accompanied by a secure admin dashboard powered by Supabase.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture &amp; Tech Stack](#-architecture--tech-stack)
- [Directory Structure](#-directory-structure)
- [Environment Configuration](#-environment-configuration)
- [Database &amp; Storage Setup](#-database--storage-setup)
- [Installation &amp; Getting Started](#-installation--getting-started)
- [Admin Panel &amp; Security](#-admin-panel--security)
- [Scripts](#-scripts)
- [Credits](#-credits)

---

## 🏢 Overview

**Our Home** is an integrated architectural, engineering, and contracting firm operating in Masyaf, Syria. The web application fulfills three main functions:

1. **Portfolio & Brand Showcase:** Highlighting completed and ongoing residential, commercial, interior design, and renovation projects.
2. **Post-Allocation Contract Engine:** Informational hub detailing an innovative building-materials-indexed savings formula protecting clients' investments from local currency depreciation.
3. **Internal Administration:** Protected content management system (CMS) allowing administrators to manage portfolio items, image galleries, and verified client testimonials with physical cloud storage synchronization.

---

## ✨ Key Features

### Client-Facing Features

- **Hero & Services Showcases:** Detailed service breakdowns covering 2D/3D design, structural/seismic studies, site supervision, turn-key finishing, and real estate valuation.
- **Dynamic Project Portfolio:** Filterable grid by category (residential, interior, exterior, architecture, commercial, renovation) with interactive full-screen image gallery modal supporting keyboard navigation.
- **Post-Allocation Savings Contract ("عقد لاحق التخصص"):** Educational landing page with detailed savings mechanics, milestone breakdown, and comprehensive FAQs.
- **Engineering Training Hub:** Showcase of the firm's ongoing graduate mentoring initiatives with direct internship application triggers.
- **Smart Contact Integration:** Context-aware WhatsApp link generation dynamically pre-populating client inquiry subjects, direct telephony dialing, and interactive Google Maps location.
- **RTL & Typography:** Tailored for Arabic typography using the Google Font `Tajawal` with smooth scrolling and responsive design.

### Administrative CMS

- **Authenticated Access:** Powered by Supabase Auth with server-side cookie verification.
- **Project Lifecycle Management:** Full CRUD capabilities for projects including title, category, location, area, client name, completion date, status (ongoing/completed), and featured status.
- **Multi-Image Storage Synchronization:** Direct client-side batch uploads with percentage progress indicators; automated physical deletion of orphaned assets in Supabase Storage upon image replacement or removal.
- **Testimonial Management:** Review dashboard supporting star ratings, client avatar upload, and SweetAlert2-backed confirmation modals.

---

## 🛠 Architecture & Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Components & Server Actions)
- **UI Runtime:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with custom `@theme` configuration
- **Database & Storage:** [Supabase](https://supabase.com/) (PostgreSQL & Supabase Storage)
- **Authentication:** `@supabase/ssr` with Next.js Middleware session refresh
- **Client Utilities:** `sweetalert2` for alerts, `react-icons` for iconography
- **Bundler:** Webpack (configured in `package.json` for deterministic cross-platform stability)

---

## 📂 Directory Structure

```text
├── app/
│   ├── admin/                         # Authenticated admin routes
│   │   ├── projects/                  # Project listings, creation, and editing
│   │   │   ├── [id]/edit/page.tsx     # Full project metadata & gallery editor
│   │   │   ├── new/page.tsx           # Multi-asset upload & creation wizard
│   │   │   ├── DeleteButton.tsx       # SweetAlert2-confirmed project deletion
│   │   │   └── page.tsx               # Projects dashboard table
│   │   ├── testimonials/              # Client feedback management
│   │   │   ├── actions.ts             # Secure Server Actions for testimonials
│   │   │   ├── AddTestimonialForm.tsx # Client creation form with image upload
│   │   │   ├── DeleteTestimonialButton.tsx # Safe testimonial deletion button
│   │   │   └── page.tsx               # Testimonials dashboard
│   │   ├── actions.ts                 # Shared administrative Server Actions
│   │   └── layout.tsx                 # Sidebar layout for admin dashboard
│   ├── auth/
│   │   └── signout/route.ts           # Route Handler processing session termination
│   ├── components/                    # Reusable client and server UI modules
│   │   ├── AboutSection.tsx           # Company background and metrics
│   │   ├── Footer.tsx                 # Navigation links and office coordinates
│   │   ├── Hero.tsx                   # Main call-to-action sections
│   │   ├── ImageGallery.tsx           # Full-screen lightbox modal
│   │   ├── Navbar.tsx                 # Navigation with custom hash-scroll polling
│   │   ├── PortfolioGrid.tsx          # Filterable category project grid
│   │   ├── ServicesSection.tsx        # Grid of architectural services
│   │   └── Testimonials.tsx           # Homepage customer quotes section
│   ├── contact/                       # Contact details, WhatsApp generator, Google Map
│   ├── login/                         # Administrator authentication entrypoint
│   ├── portfolio/                     # Public project catalog & dynamic [id] view
│   ├── post-allocation/               # Post-Allocation Contract explainer page
│   ├── team/                          # Leadership bios and internship application
│   ├── utils/supabase/server.ts       # SSR Supabase Client factory
│   ├── globals.css                    # Tailwind CSS v4 setup and CSS variables
│   ├── layout.tsx                     # Root layout applying fonts and metadata
│   ├── loading.tsx                    # Suspense fallback skeleton
│   └── page.tsx                       # Homepage composite
├── public/                            # Static images, icons, and company logos
├── middleware.ts                      # Edge route guard and cookie sync
├── next.config.ts                     # Remote image patterns & payload size constraints
├── package.json                       # Package dependencies and scripts
├── pnpm-workspace.yaml                # Build compilation policies
└── tsconfig.json                      # Strict TypeScript compiler options
```

---

## 🔐 Environment Configuration

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

---

## 🗄 Database & Storage Setup

Run the following SQL definitions inside your Supabase project's SQL Editor:

```sql
-- 1. Projects Table
create table public.projects (
  id bigint generated by default as identity primary key,
  title text not null,
  slug text,
  description text,
  category text not null,
  location text,
  client_name text,
  area text,
  completion_date text,
  status text default 'completed',
  is_featured boolean default false,
  image_url text not null,
  images_gallery text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Testimonials Table
create table public.testimonials (
  id bigint generated by default as identity primary key,
  client_name text not null,
  role text,
  content text not null,
  rating integer default 5,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Row Level Security (RLS)
alter table public.projects enable row level security;
alter table public.testimonials enable row level security;

-- Read policies (Public Access)
create policy "Public read projects" on public.projects for select using (true);
create policy "Public read testimonials" on public.testimonials for select using (true);

-- Write policies (Authenticated Admin Only)
create policy "Admin insert projects" on public.projects for insert with check (auth.role() = 'authenticated');
create policy "Admin update projects" on public.projects for update using (auth.role() = 'authenticated');
create policy "Admin delete projects" on public.projects for delete using (auth.role() = 'authenticated');

create policy "Admin insert testimonials" on public.testimonials for insert with check (auth.role() = 'authenticated');
create policy "Admin update testimonials" on public.testimonials for update using (auth.role() = 'authenticated');
create policy "Admin delete testimonials" on public.testimonials for delete using (auth.role() = 'authenticated');
```

### Storage Buckets Setup

Create two public storage buckets in Supabase:

1. `projects`
2. `testimonials`

Ensure storage policies allow `SELECT` for public access and `INSERT`/`DELETE` operations for authenticated users.

---

## 🚀 Installation & Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
pnpm build
pnpm start
```

---

## 🛡 Admin Panel & Security

- **Route Guard:** `middleware.ts` intercepts all requests targeting `/admin/:path*`. Unauthenticated requests are redirected to `/login`.
- **Reverse Redirect:** Authenticated sessions attempting to access `/login` are automatically redirected to `/admin/projects`.
- **Session Preservation:** Refreshed session tokens are copied to the response redirect headers to prevent intermittent sign-outs.
- **Server Actions Guard:** All mutating Server Actions (`deleteProject`, `addTestimonial`, `deleteTestimonial`) perform verified cryptographic checks (`supabase.auth.getUser()`) before querying or modifying database and storage resources.
- **Storage Lifecycle:** Deleting projects or testimonials automatically triggers deletion of their corresponding remote storage files, preventing orphaned assets.

---

## 📜 Scripts

| Command        | Purpose                                                                         |
| :------------- | :------------------------------------------------------------------------------ |
| `pnpm dev`   | Starts the Next.js development server using Webpack for stable HMR              |
| `pnpm build` | Compiles and validates TypeScript, checks lint rules, and builds for production |
| `pnpm start` | Serves the optimized production build locally                                   |
| `pnpm lint`  | Runs ESLint verification across the application                                 |

---

## 👥 Credits

- **Entity:** Our Home for Engineering and Contracting (Masyaf, Syria).
- **Executive Supervision:** Eng. Mohammad Kamel Ali.
- **Design & Engineering:** Abbas Satwr.
