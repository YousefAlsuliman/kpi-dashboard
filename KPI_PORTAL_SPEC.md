# KPI Portal — Project Specification

## Overview

**KPI Portal** is a performance management system for Alinma Bank. It lets admins manage employees, define KPIs, assign scores per period, and view reports. Employees can view only their own performance dashboard. Directors get a read-only department overview showing all employees' scores at a glance. The prototype is a single HTML file with vanilla JS and localStorage — the Angular + Spring Boot rebuild will be the production version.

---

## Roles

| Role | Description |
|---|---|
| `admin` | Full access: manage employees, KPIs, assignments, view all reports |
| `employee` | Read-only: view their own performance dashboard |
| `director` | Read-only: view all employees' scores for their department; drill into any employee's KPI detail |

---

## Data Models

### User
| Field | Type | Notes |
|---|---|---|
| id | Long | PK |
| username | String | Unique |
| password | String | Hashed in real impl |
| role | Enum | `ADMIN`, `EMPLOYEE`, `DIRECTOR` |
| name | String | Full name |
| email | String | |
| department | String | e.g. Sales, Marketing, Engineering, Operations, IT Products Delivery |

### KPI
| Field | Type | Notes |
|---|---|---|
| id | Long | PK |
| name | String | |
| description | String | |
| category | String | Quality, Delivery, Learning, Engineering, Performance |
| target | Integer | Always 5 (score out of 5) |
| periodType | Enum | `MONTH`, `QUARTER`, `YEAR`, `WEEK` |

### Assignment
| Field | Type | Notes |
|---|---|---|
| id | Long | PK |
| employeeId | Long | FK → User |
| kpiId | Long | FK → KPI |
| value | Integer | 0–5 |
| period | String | e.g. "January 2025", "Q1 2025", "W45 2025", "2025" |
| notes | String | Optional notes from admin |

#### Period Format by Type
| Period Type | Example |
|---|---|
| Monthly | "January 2025" |
| Quarterly | "Q1 2025" |
| Weekly | "W45 2025" |
| Yearly | "2025" |

---

## Seed KPIs (12 total)

| # | Name | Category | Period Type |
|---|---|---|---|
| 1 | Defects Aging XP for 5+ days | Quality | Monthly |
| 2 | Defects Aging SME/NCIB/MAR/Other Squads for 10+ days | Quality | Monthly |
| 3 | BRs Exceeded Dev Planned / Re-planned | Delivery | Monthly |
| 4 | ICRs/TRs Exceeded Dev Planned / Re-planned | Delivery | Monthly |
| 5 | KT Sessions Execution | Learning | Monthly |
| 6 | BRs Pushed Back | Delivery | Monthly |
| 7 | Annual Training Hours | Learning | Yearly |
| 8 | Quarterly Project Delivery Rate | Delivery | Quarterly |
| 9 | Weekly Defects Resolved | Quality | Weekly |
| 10 | Annual Performance Review Score | Performance | Yearly |
| 11 | Quarterly Sprint Velocity | Delivery | Quarterly |
| 12 | Weekly PR Merge Rate | Engineering | Weekly |

---

## Performance Score Logic

```
percentage = (value / 5) × 100
```

| % Range | Status Label | Badge Color |
|---|---|---|
| ≥ 90% | Excellent | Green |
| ≥ 75% | Good / On Track | Purple |
| ≥ 60% | Fair | Amber/Yellow |
| < 60% | Needs Work | Red |

Average score for an employee = average of all their KPI percentages in the period.

---

## App Shell Layout

```
┌──────────────────────────────────────────────────┐
│  SIDEBAR (256px, fixed)  │  MAIN AREA             │
│                          │  ┌──────────────────┐  │
│  [Alinma Logo]           │  │ TOPBAR (62px)     │  │
│                          │  │ Page Title  Date  │  │
│  [Avatar] Name           │  └──────────────────┘  │
│           Role Pill      │  ┌──────────────────┐  │
│                          │  │                  │  │
│  ── OVERVIEW ──          │  │  CONTENT AREA    │  │
│  > Dashboard             │  │  (dynamic)       │  │
│  ── MANAGEMENT ──        │  │                  │  │
│  > KPI Metrics           │  │                  │  │
│  > Assign KPIs           │  └──────────────────┘  │
│  > Employees             │                        │
│  ── REPORTS ──           │                        │
│  > Performance Report    │                        │
│                          │                        │
│  [Sign Out]              │                        │
└──────────────────────────────────────────────────┘
```

- Sidebar nav items shown depend on role:
  - **Admin**: all 5 items (Dashboard, KPI Metrics, Assign KPIs, Employees, Performance Report)
  - **Director**: single item — "Department Overview" under "Overview"
  - **Employee**: single item — "Dashboard" under "My Performance"
- Topbar shows the current page title (left) and today's date (right)
- Content area re-renders on navigation

---

## Pages

### Login Page (unauthenticated)

Full-screen centered card on a dark gradient background.

- Logo (Alinma) at top
- Title: "KPI Portal", subtitle: "Performance Management System"
- Form: Username input, Password input, Sign In button
- Error message shown inline below form on bad credentials
- (Dev only) Demo credentials box listing clickable username/password pairs

---

### Admin — Dashboard

**Summary Stats Row** (4 cards):
1. Total Employees (icon: users)
2. KPI Metrics count (icon: bullseye)
3. Assignments for latest period (icon: tasks)
4. Avg Performance % for latest period (icon: chart-line)

**Two-Column Section**:
- Left card: "Employee Performance — [latest period]" table
  - Columns: Employee (avatar + name + dept), KPIs count, Avg Score %, Status badge
  - Button: "Assign" → navigates to Assign KPIs page
- Right card: "KPI Metrics" table
  - Columns: KPI name, Category badge, # employees assigned
  - Button: "Add KPI" → navigates to KPI Metrics page

---

### Admin — KPI Metrics

**Type Tabs** (filter, single select): All | Yearly | Quarterly | Monthly | Weekly

**Table card** — header shows count and has "Add KPI" button.
- Columns: Name, Description, Category badge, Period badge, Actions (Edit / Delete)
- Empty state shown if no KPIs match the filter

**Add / Edit KPI Modal**:
- Fields: KPI Name (required), Description (textarea), Category (text input), Period Type (dropdown: Monthly/Quarterly/Yearly/Weekly)
- Footer: Cancel | Save KPI

---

### Admin — Assign KPIs

**Type Tabs**: All | Yearly | Quarterly | Monthly | Weekly

**Split Layout (400px left | flex right)**:

Left card — "Assign KPI Value" form:
- Period Type select (auto-syncs with selected KPI)
- Employee select
- KPI select (filtered by selected period type)
- Period field (dynamic based on type):
  - Monthly → Year dropdown + Month dropdown
  - Quarterly → Year dropdown + Q1/Q2/Q3/Q4 dropdown
  - Weekly → Year dropdown + W1–W52 dropdown
  - Yearly → Year dropdown only
- Score input (0–5)
- Notes textarea
- "Save Assignment" button

Right card — "Current Assignments" table:
- Filtered by selected type and period
- Year/Period filter dropdowns above table
- Columns: Employee, KPI, Period, Score, Achievement badge, Notes, Delete button

---

### Admin — Employees

Single card with "Add Employee" button.

**Table**:
- Columns: Name (avatar + name), Username, Email, Department, Assignments count, Actions (Edit / Delete)
- Empty state if no employees

**Add / Edit Employee Modal**:
- Fields: Full Name (required), Department, Email, Username (required), Password (required on add, optional on edit)

---

### Admin — Performance Report

**Type Tabs**: All | Yearly | Quarterly | Monthly | Weekly

**Period Filter** (Year + sub-period dropdowns, same pattern as Assign page)

**Report Content** — one card per employee who has data for the selected period:
- Card header: Employee avatar + name + department + period label + Overall Score % (top-right)
- Table columns: KPI, Category, (Period — only in "All" view), Value (x/5), Target (5), Achievement (badge + %), Notes

---

### Director — Department Overview

Single page. Read-only. No navigation items beyond this page.

**Department Banner** (dark gradient card):
- "Department" label + department name (e.g. "IT Products Delivery")
- Selected period label
- Four summary stats: Team Average % | Employees | Excellent count | Needs Work count

**Type Tabs**: All | Yearly | Quarterly | Monthly | Weekly

**Period Filter** (Year + sub-period dropdowns, same compound control pattern as other pages; filters the grid live)

**Employee Score Grid** (auto-fill card grid, min 265px per card):
- One card per employee showing:
  - Avatar + name + department + status badge
  - Large score number (e.g. "82%") in status color, or "—" if no data
  - Progress bar colored by status
  - KPI count for the period
  - "View Details ›" link
- Clicking a card opens the Employee Detail Modal

**Employee Detail Modal** (triggered by card click):
- Header: Employee avatar + name + department + overall score % + status badge
- Table: KPI, Category, (Period — only in "All" view), Value (x/5), Target (5), Achievement badge, Notes
- Empty state if no KPIs assigned for the selected period
- Footer: Close button

---

### Employee — Dashboard (My Performance)

**Performance Hero Banner** (dark gradient card):
- "Overall Performance Score" label
- Large score number (e.g. "82 / 100")
- Sub-label: performance status + period (e.g. "Good Performance — May 2025")
- Three stats row: KPIs Tracked | Excellent | Needs Work

**Type Tabs**: All | Yearly | Quarterly | Monthly | Weekly

**Period Filter** (same pattern, but scoped to employee's own data)

**KPI Table** (inside a card):
- Header: summary title + Overall % display
- Columns: KPI, Category, (Period — only in "All" view), Value (x/5), Target (5), Achievement (mini progress bar + badge + %), Notes

---

## Shared UI Components

### Stat Card
Icon box (colored square) + numeric value + label text.
Icon colors: blue, green, purple, amber.

### Director Employee Card
Card with avatar, name, department, status badge, large score %, progress bar, KPI count, and "View Details" link. Lifts on hover. Clickable — opens detail modal.

### KPI Card (card variant, not used in current pages but styled)
Card with colored top border (3px) by status, large value display, progress bar, status badge.

### Progress Bar
Thin bar, color matches status: green (excellent), purple (good), amber (warning), red (poor).

### Badge
Pill-shaped labels. Colors: excellent (green), good (purple), warning (amber), poor (red), neutral (gray).

### Period Pills / Type Tabs
Rounded button group. Active tab is filled with primary color.

### Modal
Centered overlay with backdrop blur.
- Header: title + close (×) button
- Body: form content
- Footer: Cancel + primary action button
- Slide-up animation on open

### Toast Notifications
Fixed bottom-right stack. Types: success (dark green), error (dark red), info (dark blue).

### Empty State
Centered icon + heading + description paragraph. Used when tables have no rows.

---

## Angular Component Map (suggested)

```
AppComponent
├── LoginComponent               (/login)
├── AppShellComponent            (layout wrapper after login)
│   ├── SidebarComponent
│   ├── TopbarComponent
│   └── Router Outlet
│       ├── Admin
│       │   ├── DashboardComponent         (/dashboard)
│       │   ├── KpiMetricsComponent        (/kpis)
│       │   ├── AssignKpisComponent        (/assign)
│       │   ├── EmployeesComponent         (/employees)
│       │   └── PerformanceReportComponent (/report)
│       ├── Director
│       │   └── DeptOverviewComponent      (/dept-overview)
│       └── Employee
│           └── MyDashboardComponent       (/my-dashboard)
└── Shared
    ├── StatCardComponent
    ├── BadgeComponent
    ├── ProgressBarComponent
    ├── ModalComponent
    ├── ToastComponent
    ├── PeriodFilterComponent
    └── DirectorEmpCardComponent
```

---

## Spring Boot API Endpoints (suggested)

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Returns JWT |
| POST | `/api/auth/logout` | Invalidates token |

### Users (Admin only)
| Method | Path | Description |
|---|---|---|
| GET | `/api/users` | List employees |
| POST | `/api/users` | Create employee |
| PUT | `/api/users/{id}` | Update employee |
| DELETE | `/api/users/{id}` | Delete employee (cascades assignments) |

### KPIs (Admin: full CRUD; Employee/Director: GET only)
| Method | Path | Description |
|---|---|---|
| GET | `/api/kpis` | List KPIs (optionally `?periodType=month`) |
| POST | `/api/kpis` | Create KPI |
| PUT | `/api/kpis/{id}` | Update KPI |
| DELETE | `/api/kpis/{id}` | Delete KPI (cascades assignments) |

### Assignments
| Method | Path | Description |
|---|---|---|
| GET | `/api/assignments` | List (admin/director: all; employee: own). Filters: `?employeeId=`, `?period=`, `?periodType=`, `?year=` |
| POST | `/api/assignments` | Create or update (upsert by employeeId+kpiId+period) |
| DELETE | `/api/assignments/{id}` | Remove |

### Reports
| Method | Path | Description |
|---|---|---|
| GET | `/api/reports/summary` | Aggregated stats for dashboard (total employees, KPI count, latest avg score) |
| GET | `/api/reports/performance` | Per-employee KPI breakdown. Filters: `?period=`, `?periodType=`, `?year=` |
| GET | `/api/reports/dept-overview` | Director view: all employees' avg scores for a period. Filters: `?period=`, `?periodType=`, `?year=` |

---

## Notes for Implementation

- KPI `target` is always 5; score percentage = `(value / 5) * 100`
- The period string format must be consistent — parse it on the backend for filtering by year (extract trailing 4-digit year) or by sub-period
- Admin sees all data; employee requests are scoped by the JWT's userId on the backend
- Director requests are read-only and scoped to employees only (not other directors/admins); backend should enforce `role = EMPLOYEE` filter when serving director requests
- Period filter in the UI is a compound control: Year dropdown + sub-period dropdown (month/quarter/week). "Yearly" KPIs only show the year dropdown.
- Type tabs filter which KPIs appear. "All" shows the latest assignment per KPI per employee (de-duplicated)
- Director role has no write access — all POST/PUT/DELETE endpoints should return 403 for director JWT tokens
