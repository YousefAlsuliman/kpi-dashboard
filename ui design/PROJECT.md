# KPI Portal — Project Reference

## Overview

A single-file SPA (`index.html`) — no build step, no framework, no server.  
All logic is vanilla HTML + CSS + JavaScript. Data lives in `localStorage`.

---

## File

```
ui design/index.html   ← the entire application
```

---

## Tech Stack

- **Vanilla JS** — no libraries, no bundler
- **Font Awesome** (CDN) — icons
- **Google Fonts** (CDN) — Inter typeface
- **localStorage** — persistence, key: `kpiPortal_v7`

> Bump the key suffix (`v7` → `v8`, etc.) whenever seed data changes to force the browser to reload fresh data.

---

## Authentication

Plain username/password matched against `SEED.users` in memory. No hashing.

| Username   | Password  | Role     | Department  |
|------------|-----------|----------|-------------|
| admin      | admin123  | admin    | —           |
| abdulaziz  | pass123   | employee | Sales       |
| fahad      | pass123   | employee | Marketing   |
| sultan     | pass123   | employee | Engineering |
| mohamed    | pass123   | employee | Operations  |

`me` — global variable holding the logged-in user object.

---

## Data Model (localStorage)

```js
{
  users:       [...],   // id, username, password, role, name, email, department
  kpis:        [...],   // id, name, description, category, target (always 5), periodType
  assignments: [...]    // id, employeeId, kpiId, value (0–5), period, notes
}
```

### KPI `periodType` values
- `"month"` — tracked monthly
- `"quarter"` — tracked quarterly
- `"year"` — tracked yearly
- `"week"` — tracked weekly

### `period` string formats (must match exactly)
| Type    | Format example  |
|---------|-----------------|
| month   | `"May 2026"`    |
| quarter | `"Q2 2026"`     |
| year    | `"2026"`        |
| week    | `"W19 2026"`    |

### Scoring

All KPIs score **0–5**. `target` is always `5`.

```js
function calcPct(value, kpi) {
  return Math.max(0, Math.min(100, Math.round((value / 5) * 100)));
}
```

Achievement thresholds:
| pct     | status badge | label        |
|---------|--------------|--------------|
| ≥ 90    | excellent    | Excellent    |
| ≥ 75    | good         | Good         |
| ≥ 60    | warning      | Fair         |
| < 60    | danger       | Needs Work   |

---

## KPIs (12 total)

| ID | Name                                               | Category    | Period  |
|----|----------------------------------------------------|-------------|---------|
| 1  | Defects Aging XP for 5+ days                       | Quality     | month   |
| 2  | Defects Aging SME/NCIB/MAR/Other Squads for 10+ days | Quality   | month   |
| 3  | BRs Exceeded Dev Planned / Re-planned              | Delivery    | month   |
| 4  | ICRs/TRs Exceeded Dev Planned / Re-planned         | Delivery    | month   |
| 5  | KT Sessions Execution                              | Learning    | month   |
| 6  | BRs Pushed Back                                    | Delivery    | month   |
| 7  | Annual Training Hours                              | Learning    | year    |
| 8  | Quarterly Project Delivery Rate                    | Delivery    | quarter |
| 9  | Weekly Defects Resolved                            | Quality     | week    |
| 10 | Annual Performance Review Score                    | Performance | year    |
| 11 | Quarterly Sprint Velocity                          | Delivery    | quarter |
| 12 | Weekly PR Merge Rate                               | Engineering | week    |

---

## Seed Data Coverage

704 assignments across all employees and period types:

| Section   | Years covered         | Periods                          |
|-----------|-----------------------|----------------------------------|
| Monthly   | 2025, 2026            | All 12 months 2025 + Jan–May 2026 |
| Quarterly | 2025, 2026            | Q1–Q4 2025, Q1–Q2 2026           |
| Weekly    | 2025, 2026            | W45–W52 2025, W1–W20 2026        |
| Yearly    | 2024, 2025, 2026      | One entry per year               |

---

## Navigation & Views

### Admin views (role: `"admin"`)
| Route         | Function        | Description                        |
|---------------|-----------------|------------------------------------|
| `dashboard`   | `dashboard()`   | Summary cards + latest assignments |
| `kpis`        | `kpis()`        | KPI list, add/edit/delete          |
| `assign`      | `assign()`      | Assign scores to employees         |
| `employees`   | `employees()`   | Employee list, add/edit/delete     |
| `report`      | `report()`      | Per-employee performance report    |

### Employee views (role: `"employee"`)
| Route           | Function          | Description                        |
|-----------------|-------------------|------------------------------------|
| `emp-dashboard` | `empDashboard()`  | Personal performance + KPI table   |

---

## Period Filtering Pattern

Every section that filters by period uses a **year-first, subsection-second** approach — **no free-text, no flat period pills**.

### Filter element IDs per page
| Page                       | Year select ID | Subsection select ID | Update function        |
|----------------------------|---------------|----------------------|------------------------|
| Assign — Current Assignments | `aFYear`    | `aFSub`              | `applyAssignFilter()`  |
| Report                     | `rFYear`      | `rFSub`              | `applyReportFilter()`  |
| Employee Dashboard         | `eFYear`      | `eFSub`              | `applyEmpDashFilter()` |

### Subsection options per type
- `month` → January … December
- `quarter` → Q1, Q2, Q3, Q4
- `week` → W1 … W52
- `year` → year dropdown only, no subsection

### Period string construction
```js
// type === 'year'  → period = year           ("2026")
// all others       → period = sub + " " + year  ("May 2026")
function readPeriod(type, yearId, subId) {
  const year = v(yearId), sub = v(subId);
  return type === 'year' ? year : (sub && year ? `${sub} ${year}` : '');
}
```

### Shared helper functions
```js
yearsForType(type, empId?)          // distinct years from data for a given type
subsectionsForType(type)            // ordered array of subsection labels
latestSubForYear(type, year, empId?)// most recent subsection with data in that year
periodFilterHtml(type, years, yearId, subId, onchangeFn, empId?)  // renders the two dropdowns
readPeriod(type, yearId, subId)     // builds the period string from DOM values
```

---

## Assign KPI Form

**Flow:** Period Type → (filters KPI dropdown) → KPI → Year + Period subsection → Score → Notes → Save

- Period Type select: `#aPeriodType` → calls `filterKpiByType()`
- KPI select: `#aKpi` → calls `updatePeriodHint()` (auto-syncs period type)
- Period field: `#aPerWrap` container — `updatePeriodField(pt)` writes either a year+sub flex row or year-only select inside it
- Score: `#aVal` — number input, 0–5
- Period saved as `"sub year"` string (e.g. `"May 2026"`), or just `"2026"` for yearly

---

## Global State Variables

```js
let me = null;            // logged-in user object
let _empDashType = 'all'; // active tab on employee dashboard
let _reportType  = 'all'; // active tab on report page
let _kpisType    = 'all'; // active tab on KPI management page
let _assignType  = 'all'; // active tab on assign page
```

---

## Key Utility Functions

```js
db()                        // read from localStorage (or init from SEED)
save(d)                     // write to localStorage
nid(arr)                    // next id (max existing + 1)
v(id)                       // document.getElementById(id).value.trim()
calcPct(value, kpi)         // (value/5)*100, clamped 0–100
avgPercent(assignments, kpis) // mean calcPct across a set of assignments
latestAssignments(empId)    // latest assignment per KPI for one employee
latestAssignmentsAll()      // latest assignment per employee-KPI pair (all employees)
status(pct)                 // "excellent" | "good" | "warning" | "danger"
statusLabel(pct)            // "Excellent" | "Good" | "Fair" | "Needs Work"
modal(title, body, footer)  // show modal dialog
closeModal()                // hide modal
toast(msg, type)            // show toast notification
go(view)                    // navigate to a view (updates nav active state + renders content)
buildNav()                  // render sidebar nav based on me.role
```

---

## CSS Notes

- CSS custom properties for theming: `--primary`, `--surface`, `--border`, `--muted`, etc.
- Component classes: `.card`, `.card-head`, `.card-body`, `.badge`, `.btn`, `.tbl-wrap`, `.form-grid`, `.ff`, `.type-tabs`, `.type-tab`, `.perf-hero`
- Status color classes: `.excellent` (green), `.good` (purple), `.warning` (amber), `.danger` (red)
- Removed: `.kpi-grid` / `.kpi-card` from employee dashboard (replaced with table card); `.period-pills` / `.pp` no longer used for filtering

---

## What Was Removed

- `unit` field on KPIs (all scores are 0–5)
- `lowerIsBetter` / direction field on KPIs
- **My KPIs** page (employee nav) — its content was merged into the employee Dashboard
- Period pills (`<button class="pp">`) replaced by year+subsection dropdowns everywhere
