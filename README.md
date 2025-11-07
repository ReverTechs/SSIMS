# SSIMS - School Information Management System

<p align="center">
  <strong>Blessings Rever Chilemba</strong>
</p>

<p align="center">
  A comprehensive school information management system built with Next.js and Supabase
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#user-roles"><strong>User Roles</strong></a> ·
  <a href="#project-structure"><strong>Project Structure</strong></a>
</p>

<br/>

## Features

### Core Functionality
- **Role-Based Access Control** - Six distinct user roles with customized dashboards
- **Student Management** - Registration, profiles, and academic tracking
- **Grade Management** - Enter, view, and track student grades
- **Fee Management** - Track student fees, payments, and balances
- **Report Generation** - Academic reports and system reports
- **Announcements** - School-wide announcements with role-based targeting
- **Calendar & Events** - School calendar with events, exams, and meetings
- **Timetable** - Class schedules and timetables
- **Subject Management** - Subject registration and tracking
- **Teacher Management** - Teacher registration and management

### Technical Features
- **Modern Stack** - Next.js 16 with App Router and Turbopack
- **Authentication** - Secure authentication with Supabase Auth
- **Database** - PostgreSQL database with Supabase
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **UI Components** - Beautiful components with shadcn/ui
- **Dark Mode** - Full dark mode support
- **Type Safety** - Full TypeScript support

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) 16 (App Router)
- **Database & Auth:** [Supabase](https://supabase.com)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **Icons:** [Lucide React](https://lucide.dev)
- **Deployment:** Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project ([create one here](https://database.new))

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd ssims
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

   > [!NOTE]
   > You can find these values in your [Supabase project settings](https://supabase.com/dashboard/project/_/settings/api)

4. **Set up the database**

   Run the migration to create the necessary tables:

   ```bash
   # In Supabase Dashboard → SQL Editor
   # Copy and run the contents of: supabase/migrations/001_create_user_profiles.sql
   ```

   See [QUICK_START_ROLES.md](./QUICK_START_ROLES.md) for detailed instructions.

5. **Run the development server**

   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000)

### First Steps

1. **Sign up** at `/auth/sign-up` with your email and select a role
2. **Log in** at `/auth/login`
3. Explore the dashboard based on your role!

For detailed role management instructions, see [QUICK_START_ROLES.md](./QUICK_START_ROLES.md)

## User Roles

The system supports six distinct user roles, each with customized access and features:

| Role | Description | Key Features |
|------|-------------|--------------|
| **Student** | Regular students | View grades, fees, reports, announcements, calendar, timetable, subjects, teachers |
| **Teacher** | Teaching staff | Enter grades, view students, view reports, announcements, calendar, timetable |
| **Headteacher** | School principal | All teacher features + manage teachers, system reports |
| **Deputy Headteacher** | Assistant principal | All teacher features + manage teachers |
| **Guardian** | Parents/guardians | View student grades, reports, announcements, calendar, timetable, subjects, teachers |
| **Admin** | System administrators | Full access: register students/teachers, generate passwords, system reports |

## Project Structure

```
ssims/
├── app/                          # Next.js App Router pages
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   └── update-password/
│   ├── dashboard/                # Main dashboard pages
│   │   ├── announcements/
│   │   ├── calendar/
│   │   ├── enter-grades/
│   │   ├── fees/
│   │   ├── grades/
│   │   ├── manage-teachers/
│   │   ├── passwords/
│   │   ├── profile/
│   │   ├── register-students/
│   │   ├── register-teachers/
│   │   ├── reports/
│   │   ├── students/
│   │   ├── subjects/
│   │   ├── system-reports/
│   │   ├── teachers/
│   │   └── timetable/
│   └── layout.tsx                 # Root layout
├── components/                    # React components
│   ├── dashboard/                 # Dashboard-specific components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── dashboard-layout.tsx
│   │   └── breadcrumb.tsx
│   ├── ui/                        # shadcn/ui components
│   └── auth/                      # Authentication components
├── lib/                           # Utility libraries
│   ├── supabase/                  # Supabase client configuration
│   └── utils.ts                   # Utility functions
├── types/                         # TypeScript type definitions
│   └── index.ts
├── supabase/                      # Supabase configuration
│   └── migrations/               # Database migrations
└── public/                        # Static assets
    └── images/
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Features by Module

### Dashboard
- Role-based navigation
- Quick stats and overview
- Upcoming events and schedule
- Responsive mobile design

### Grades
- View grades by subject and term
- Grade entry for teachers
- Academic progress tracking

### Fees
- Fee balance tracking
- Payment history
- Due date reminders

### Reports
- Academic reports
- System reports (admin only)
- Downloadable reports

### Announcements
- School-wide announcements
- Role-based targeting
- Expiration dates

### Calendar
- School events
- Exams and meetings
- Academic calendar

### Timetable
- Class schedules
- Period management
- Room assignments

## Documentation

- [QUICK_START_ROLES.md](./QUICK_START_ROLES.md) - Quick guide for role management
- [ROLE_MANAGEMENT_GUIDE.md](./ROLE_MANAGEMENT_GUIDE.md) - Complete role management documentation

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your Supabase environment variables
4. Deploy!

The Vercel deployment will automatically detect Next.js and configure the build settings.

### Environment Variables

Make sure to set these in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is private and proprietary to Blessings Rever Chilemba.

## Support

For issues and questions, please contact the system administrator.

---

**Built with ❤️ by Blessings Rever Chilemba**
