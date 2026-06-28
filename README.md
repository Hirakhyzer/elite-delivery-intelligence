# Elite Delivery Intelligence

A white, black, and `#f4af00` gold React planning workspace for **Elite Era Development L.L.C.** It helps project leadership assign work, forecast team capacity, detect deadline and budget risk, compare staffing scenarios, and export delivery reports.

## What it plans

- Project scope, client tier, priority, contract value, target deadline, and risk reserve
- Tasks with estimated hours, required skills, dependencies, status, notes, and manual assignment overrides
- Employee skills, seniority, hourly cost, weekly capacity, availability, and existing commitments
- Contractor capacity and deadline extension scenarios

## Scheduling logic

The engine ranks potential assignees using:

```text
Skill match + capacity availability + seniority + cost efficiency - limited availability penalty
```

Then it schedules work after dependencies and employee queue pressure, and calculates:

- Best-fit staffing recommendation per task
- Task start and finish forecast
- Employee utilization and overload risk
- Projected completion date and deadline slip
- Labor cost, fixed cost, risk reserve, forecast profit, and margin
- Blocker, dependency, budget, workload, and schedule risk score
- Project health: On track / At risk / Delayed
- Recovery comparisons: current plan, specialist contractor, deadline extension, and balanced recovery

## Features

- Animated command center
- Interactive task planner and dependency map
- Manual staffing override and automatic assignment
- Add delivery tasks with skills and dependency links
- Editable employee capacity, cost, availability, and commitments
- Skill-coverage matrix
- What-if scenario simulator
- Saved plan snapshot library
- TXT, JSON, and print/PDF delivery reports
- Browser local storage persistence
- Responsive design
- Unit tests and GitHub Actions build checks

## Run locally

```bash
npm install
npm run dev
```

Open the local address shown in the terminal, usually `http://localhost:5173`.

## Run tests

```bash
npm test
```

## Project structure

```text
src/
  data.js             Project, task, employee, and scenario data
  engine.js           Assignment, scheduling, cost, risk, and scenario logic
  App.jsx             State, persistence, exports, and actions
  views/              Command center, planner, team, scenarios, and reports
  styles.css          Shared brand style imports
```

---

## Author

Made by **Hira Khyzer**

Developed as part of the **Elite Era Development L.L.C** project portfolio.

Brand color: `#f4af00`
