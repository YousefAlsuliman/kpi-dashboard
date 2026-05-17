# KPI Portal — Angular Layout Reference

This document describes the pages, their content, and what each section does.
It is intended as a blueprint for an Angular implementation.

---

## Application Shell

The app has two top-level states:

1. **Login Page** — shown when no user is authenticated
2. **App Shell** — shown after login; contains a sidebar and a main content area

### App Shell structure
- **Sidebar** — fixed on the left
  - Company logo / portal name
  - Logged-in user avatar (initials), full name, role pill (Admin / Employee)
  - Navigation links (vary by role — see below)
  - Logout button
- **Top bar** — across the top of the main area
  - Current page title
  - Today's date
- **Content area** — the main area that changes per route

---

## Authentication

### Login Page
A centered card with:
- Portal name / branding
- Username text input
- Password text input
- "Login" submit button
- Error message (shown inline when credentials are wrong)

After login, the user is redirected to their default page based on role:
- `admin` → Dashboard
- `employee` → Employee Dashboard

---

## Roles & Navigation

### Admin navigation
| Label | Route |
|---|---|
| Dashboard | `/dashboard` |
| KPI Metrics | `/kpis` |
| Assign KPIs | `/assign` |
| Employees | `/employees` |
| Performance Report | `/report` |

### Employee navigation
| Label | Route |
|---|---|
| Dashboard | `/emp-dashboard` |

---

## Admin Pages

---

### 1. Dashboard (`/dashboard`)

**Purpose:** High-level overview of the latest period's performance across all employees.

**Content:**

**Summary stat cards (4 cards):**
- Total Employees count
- Total KPI Metrics count
- Total Assignments for the latest period
- Average performance % across all employees for the latest period

**Employee Performance table:**
- Lists all employees
- Columns: Name + Department, Number of KPIs assigned, Average Score (%), Status badge (Excellent / Good / Fair / Needs Work)
- Header shows which period this data is for (the most recent period with data)
- "Assign" button in the header → navigates to Assign KPIs page

**KPI Metrics table:**
- Lists all KPIs
- Columns: KPI Name, Category badge, Number of employees assigned to it in the latest period
- "Add KPI" button in the header → navigates to KPI Metrics page

---

### 2. KPI Metrics (`/kpis`)

**Purpose:** View, create, edit, and delete KPI definitions.

**Content:**

**Period type tabs** (filter the list):
- Overview (all), Yearly, Quarterly, Monthly, Weekly

**KPI table** (filtered by selected tab):
- Columns: Name, Description, Category badge, Period Type badge, Actions (Edit / Delete buttons)
- "Add KPI" button in the header

**Add / Edit KPI — Modal dialog:**
- KPI Name (text input, required)
- Description (textarea)
- Category (text input, e.g. "Quality", "Delivery")
- Period Type (dropdown: Monthly / Quarterly / Yearly / Weekly)
- Save / Cancel buttons

**Delete KPI:** confirmation prompt before deleting; also removes all assignments for that KPI.

---

### 3. Assign KPIs (`/assign`)

**Purpose:** Assign a score (0–5) to an employee for a specific KPI and period.

**Content:**

The page is split into two side-by-side sections:

**Left — Assign KPI Value form:**
- Employee dropdown (all employees)
- Period Type dropdown (Monthly / Quarterly / Yearly / Weekly) — filters the KPI dropdown
- KPI Metric dropdown (filtered by selected period type; selecting a KPI auto-syncs the period type)
- Score input (number, 0–5)
- Period field (dynamic, depends on Period Type):
  - **Monthly**: Year dropdown + Month dropdown (January … December)
  - **Quarterly**: Year dropdown + Quarter dropdown (Q1, Q2, Q3, Q4)
  - **Yearly**: Year dropdown only
  - **Weekly**: Year dropdown + Week dropdown (W1 … W52)
- Notes (textarea, optional)
- "Save Assignment" button

If an assignment already exists for the same employee + KPI + period, it is updated rather than duplicated.

**Right — Current Assignments table:**

**Period type tabs** (filter the table):
- Overview (all), Yearly, Quarterly, Monthly, Weekly

**Period filter (below tabs):**
- **Overview tab**: Year dropdown only
- **Yearly tab**: Year dropdown only
- **Monthly tab**: Year dropdown + Month dropdown
- **Quarterly tab**: Year dropdown + Quarter dropdown
- **Weekly tab**: Year dropdown + Week dropdown

**Assignments table** (filtered by selected tab + period filter):
- Columns: Employee Name, KPI Name, Value (e.g. "4 / 5"), Period, Notes, Delete button

---

### 4. Employees (`/employees`)

**Purpose:** View, create, edit, and delete employee accounts.

**Content:**

**Employee table:**
- Columns: Name (with avatar), Username, Email, Department, Assignment Count, Actions (Edit / Delete)
- "Add Employee" button in the header

**Add / Edit Employee — Modal dialog:**
- Full Name (required)
- Department
- Email
- Username (required, must be unique)
- Password (required on add; optional on edit — leave blank to keep existing)
- Save / Cancel buttons

**Delete Employee:** confirmation prompt; also removes all their KPI assignments.

---

### 5. Performance Report (`/report`)

**Purpose:** View a detailed per-employee performance breakdown for a selected period.

**Content:**

**Period type tabs:**
- Overview (all), Yearly, Quarterly, Monthly, Weekly

**Period filter (below tabs):**
- Same pattern as Assign KPIs: Year dropdown only for Overview/Yearly; Year + subsection for Monthly/Quarterly/Weekly

**Employee report cards** (one card per employee who has data in the selected period):

Each card contains:
- Employee avatar, name, department
- Overall score % (large, displayed in the card header)
- KPI breakdown table:
  - Columns (non-Overview): KPI Name, Category, Value, Target (always 5), Achievement badge + %,  Notes
  - Columns (Overview tab): adds a Period column showing the period type badge and the specific period string for that KPI

In Overview mode, the "latest" assignment per KPI per employee is shown (not all assignments — just the most recent one within the selected year).

---

## Employee Pages

---

### 6. Employee Dashboard (`/emp-dashboard`)

**Purpose:** The employee's personal performance view — their own KPI scores only.

**Content:**

**Performance hero section (top banner):**
- Overall Performance Score (0–100)
- Performance label (Excellent / Good / Fair / Needs Improvement)
- Current period label
- Three stat counters: KPIs Tracked, Excellent count, Needs Work count

**Period type tabs:**
- Overview (all), Yearly, Quarterly, Monthly, Weekly

**Period filter (below tabs):**
- Same year-first pattern as the other pages

**KPI results table** (filtered by selected tab + period):
- Columns (non-Overview): KPI Name, Category badge, Value (e.g. "4 / 5"), Target ("5"), Achievement (progress bar + % badge), Notes
- Columns (Overview tab): adds a Period Type + Period column
- In Overview mode, shows the latest assignment per KPI within the selected year

---

## Shared Behaviors

### Period filtering pattern (used across Assign, Report, Employee Dashboard)
Every tab that shows data by period uses the same two-step filter:
1. **Year dropdown** — select the year first
2. **Subsection dropdown** — then select the specific month / quarter / week (not shown for Yearly or Overview tabs)

The Overview tab always shows a year-only dropdown.

### KPI scoring
- All KPIs score from **0 to 5**
- Target is always **5**
- Percentage = `(value / 5) × 100`, clamped to 0–100
- Achievement thresholds:
  | % range | Label |
  |---|---|
  | ≥ 90% | Excellent |
  | ≥ 75% | Good |
  | ≥ 60% | Fair |
  | < 60% | Needs Work |

### Period types and their subsections
| Period Type | Subsections |
|---|---|
| Monthly | January, February, … December (12 options) |
| Quarterly | Q1, Q2, Q3, Q4 |
| Weekly | W1, W2, … W52 |
| Yearly | No subsection — year only |

### Data model (for Angular services / API)
```ts
User        { id, username, password, role: 'admin'|'employee', name, email, department }
KPI         { id, name, description, category, target: 5, periodType: 'month'|'quarter'|'year'|'week' }
Assignment  { id, employeeId, kpiId, value: 0–5, period: string, notes }
```

Period string formats:
- Monthly: `"May 2026"`
- Quarterly: `"Q2 2026"`
- Weekly: `"W19 2026"`
- Yearly: `"2026"`

---

## Modal / Toast system

- A single **modal dialog** is reused for all add/edit forms (KPI, Employee). It has a title, body (the form), and a footer (Cancel + Save buttons).
- **Toast notifications** appear briefly for success, error, and info messages (e.g. "KPI assigned", "Name is required").
