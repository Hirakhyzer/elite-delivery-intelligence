import { initialScenario } from "./data";

const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
const complexityFactor = { Simple: 0.9, Moderate: 1, Complex: 1.18, Enterprise: 1.35 };

export const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value) || 0);
export const dateLabel = (value) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(toDate(value)) : "—";
export const percent = (value) => `${Math.round(Number(value) || 0)}%`;

export function toDate(value) {
  if (value instanceof Date) return new Date(value.getTime());
  return new Date(`${value}T12:00:00`);
}

export function dateKey(date) {
  const local = toDate(date);
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(value, days) {
  const date = toDate(value);
  date.setDate(date.getDate() + Number(days || 0));
  return dateKey(date);
}

export function addWorkDays(value, days) {
  const date = toDate(value);
  let remaining = Math.max(0, Number(days || 0));
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) remaining -= 1;
  }
  return dateKey(date);
}

export function differenceInDays(start, end) {
  return Math.round((toDate(end) - toDate(start)) / 86400000);
}

export function maxDate(values, fallback) {
  const valid = values.filter(Boolean).map(toDate);
  if (!valid.length) return fallback;
  return dateKey(new Date(Math.max(...valid.map((item) => item.getTime()))));
}

export function topologicalTasks(tasks) {
  const taskMap = new Map(tasks.map((task) => [task.id, task]));
  const visiting = new Set();
  const visited = new Set();
  const order = [];
  const missingDependencies = [];

  function visit(task) {
    if (visited.has(task.id)) return;
    if (visiting.has(task.id)) return;
    visiting.add(task.id);
    (task.dependencies || []).forEach((dependency) => {
      const parent = taskMap.get(dependency);
      if (parent) visit(parent);
      else missingDependencies.push({ taskId: task.id, dependency });
    });
    visiting.delete(task.id);
    visited.add(task.id);
    order.push(task);
  }

  [...tasks]
    .sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0))
    .forEach(visit);

  return { order, missingDependencies };
}

export function skillMatch(employee, task) {
  const required = task.skills || [];
  if (!required.length) return 1;
  return required.filter((skill) => employee.skills?.includes(skill)).length / required.length;
}

export function scoreEmployee(employee, task, workloadHours, allEmployees) {
  const match = skillMatch(employee, task);
  const maxRate = Math.max(...allEmployees.map((item) => item.hourlyRate), 1);
  const capacity = Math.max(1, employee.weeklyCapacity);
  const freeRatio = Math.max(0, capacity - workloadHours) / capacity;
  const costEfficiency = 1 - employee.hourlyRate / maxRate;
  const availabilityPenalty = employee.availability === "Limited" ? 7 : 0;
  const taskSeniority = priorityWeight[task.priority] >= 3 ? employee.seniority * 3 : employee.seniority;
  const score = match * 68 + freeRatio * 24 + costEfficiency * 8 + taskSeniority - availabilityPenalty;
  return { score, match, freeRatio };
}

export function bestAssignee(task, employees, workloads) {
  const sorted = employees
    .map((employee) => ({ employee, ...scoreEmployee(employee, task, workloads[employee.id] || 0, employees) }))
    .sort((a, b) => b.score - a.score);
  const best = sorted[0];
  return { best, ranked: sorted };
}

function buildScenarioEmployees(employees, scenario) {
  if (!scenario.addContractor) return employees;
  return [...employees, {
    id: "contractor",
    name: "Flex Delivery Specialist",
    role: "Scenario contractor",
    initials: "FD",
    skills: scenario.contractorSkills || [],
    hourlyRate: Number(scenario.contractorRate) || 125,
    weeklyCapacity: Number(scenario.contractorHours) || 30,
    committedHours: 0,
    availability: "Available",
    seniority: 3,
    temporary: true,
  }];
}

function plannedTaskHours(task, project) {
  const factor = complexityFactor[project.complexity] || 1;
  return Math.max(1, Math.round((Number(task.estimatedHours) || 0) * factor));
}

export function createDeliveryPlan({ project, employees, tasks, scenario = initialScenario }) {
  const activeScenario = { ...initialScenario, ...scenario };
  const planningEmployees = buildScenarioEmployees(employees, activeScenario);
  const capacityMultiplier = Math.max(0.65, Number(activeScenario.capacityMultiplier) || 1);
  const deadline = addDays(project.deadline, Number(activeScenario.deadlineExtensionDays) || 0);
  const { order, missingDependencies } = topologicalTasks(tasks);
  const workloads = Object.fromEntries(planningEmployees.map((employee) => [employee.id, Number(employee.committedHours) || 0]));
  const plannedHours = Object.fromEntries(planningEmployees.map((employee) => [employee.id, 0]));
  const availabilityDate = Object.fromEntries(planningEmployees.map((employee) => [employee.id, project.startDate]));
  const finishByTask = {};
  const schedule = [];
  let laborCost = 0;

  order.forEach((task) => {
    const taskHours = plannedTaskHours(task, project);
    const dependencyFinishes = (task.dependencies || []).map((id) => finishByTask[id] || project.startDate);
    const dependencyReady = maxDate(dependencyFinishes, project.startDate);
    const manual = planningEmployees.find((employee) => employee.id === task.assigneeId);
    const choice = manual ? { best: { employee: manual, match: skillMatch(manual, task), score: 100, freeRatio: 0 } } : bestAssignee(task, planningEmployees, workloads);
    const selected = choice.best?.employee || planningEmployees[0];
    const capacity = Math.max(8, selected.weeklyCapacity * capacityMultiplier);
    const queuedDays = Math.ceil((workloads[selected.id] || 0) / capacity * 5);
    const employeeReady = addWorkDays(project.startDate, queuedDays);
    const start = task.status === "Done" ? project.startDate : maxDate([dependencyReady, employeeReady], project.startDate);
    const durationDays = task.status === "Done" ? 0 : Math.max(1, Math.ceil(taskHours / capacity * 5));
    const finish = task.status === "Done" ? project.startDate : addWorkDays(start, durationDays);
    const taskCost = taskHours * selected.hourlyRate;
    workloads[selected.id] = (workloads[selected.id] || 0) + taskHours;
    plannedHours[selected.id] = (plannedHours[selected.id] || 0) + taskHours;
    availabilityDate[selected.id] = finish;
    finishByTask[task.id] = finish;
    laborCost += taskCost;
    schedule.push({
      ...task,
      plannedHours: taskHours,
      assigneeId: selected.id,
      assignee: selected.name,
      role: selected.role,
      temporary: selected.temporary || false,
      skillMatch: choice.best?.match || 0,
      assignmentScore: choice.best?.score || 0,
      start,
      finish,
      durationDays,
      cost: taskCost,
      dependencyReady,
      late: finish > deadline,
    });
  });

  const completionDate = maxDate(schedule.filter((task) => task.status !== "Done").map((task) => task.finish), project.startDate);
  const directCost = laborCost + (Number(project.fixedCosts) || 0);
  const riskReserve = directCost * Math.max(0, Number(project.riskReservePercent) || 0) / 100;
  const forecastCost = directCost + riskReserve;
  const profit = (Number(project.contractValue) || 0) - forecastCost;
  const margin = project.contractValue ? profit / project.contractValue * 100 : 0;
  const projectDurationDays = Math.max(1, differenceInDays(project.startDate, completionDate) + 1);
  const horizonWeeks = Math.max(1, Math.ceil(projectDurationDays / 7));

  const employeeStats = planningEmployees.map((employee) => {
    const weeklyCapacity = employee.weeklyCapacity * capacityMultiplier;
    const forecastWeeklyHours = (Number(employee.committedHours) + (plannedHours[employee.id] || 0) / horizonWeeks);
    const utilization = forecastWeeklyHours / Math.max(1, weeklyCapacity) * 100;
    return {
      ...employee,
      plannedHours: plannedHours[employee.id] || 0,
      totalCommittedHours: workloads[employee.id] || 0,
      forecastWeeklyHours,
      utilization,
      nextAvailable: availabilityDate[employee.id],
      overbooked: utilization > 100,
    };
  });

  const slipDays = Math.max(0, differenceInDays(deadline, completionDate));
  const blockedTasks = schedule.filter((task) => task.status === "Blocked");
  const overbookedEmployees = employeeStats.filter((employee) => employee.overbooked);
  const budgetRatio = forecastCost / Math.max(1, Number(project.contractValue) || 1);
  const scheduleRisk = slipDays ? Math.min(44, 18 + slipDays * 4) : Math.max(0, 7 - Math.max(0, differenceInDays(completionDate, deadline)) * .5);
  const budgetRisk = budgetRatio > .9 ? Math.min(28, 10 + (budgetRatio - .9) * 150) : 0;
  const workloadRisk = Math.min(20, overbookedEmployees.length * 9);
  const blockerRisk = Math.min(22, blockedTasks.length * 11);
  const dependencyRisk = Math.min(10, missingDependencies.length * 5);
  const riskScore = Math.min(100, Math.round(scheduleRisk + budgetRisk + workloadRisk + blockerRisk + dependencyRisk));
  const health = riskScore < 28 && !slipDays ? "On track" : riskScore < 60 ? "At risk" : "Delayed";

  const criticalTasks = [...schedule]
    .filter((task) => task.priority === "Critical" || task.late || task.status === "Blocked")
    .sort((a, b) => b.finish.localeCompare(a.finish));
  const recommendations = [];
  if (blockedTasks.length) recommendations.push({ type: "blocker", title: `${blockedTasks.length} blocked task${blockedTasks.length > 1 ? "s" : ""} need client or technical action`, detail: blockedTasks.map((task) => task.title).join(" · ") });
  if (slipDays) recommendations.push({ type: "deadline", title: `Projected completion is ${slipDays} day${slipDays === 1 ? "" : "s"} after the target`, detail: "Add specialist capacity, remove non-critical scope, or move the deadline." });
  if (overbookedEmployees.length) recommendations.push({ type: "capacity", title: `${overbookedEmployees.length} employee${overbookedEmployees.length > 1 ? "s are" : " is"} forecast above capacity`, detail: overbookedEmployees.map((employee) => employee.name).join(" · ") });
  if (budgetRatio > .9) recommendations.push({ type: "budget", title: `Forecast delivery cost is ${Math.round(budgetRatio * 100)}% of contract value`, detail: "Review scope, rate assumptions, fixed costs, and change-control terms." });
  if (!recommendations.length) recommendations.push({ type: "success", title: "Plan is commercially and operationally healthy", detail: "Keep tracking task progress, changes, and client approvals." });

  return {
    deadline,
    schedule,
    employeeStats,
    laborCost,
    directCost,
    riskReserve,
    forecastCost,
    profit,
    margin,
    completionDate,
    projectDurationDays,
    horizonWeeks,
    slipDays,
    blockedTasks,
    overbookedEmployees,
    missingDependencies,
    criticalTasks,
    risk: { score: riskScore, health, scheduleRisk, budgetRisk, workloadRisk, blockerRisk, dependencyRisk },
    recommendations,
  };
}

export function buildScenarioComparisons(state) {
  const baseline = createDeliveryPlan(state);
  const contractor = createDeliveryPlan({ ...state, scenario: { ...state.scenario, addContractor: true } });
  const extension = createDeliveryPlan({ ...state, scenario: { ...state.scenario, deadlineExtensionDays: 14 } });
  const balanced = createDeliveryPlan({ ...state, scenario: { ...state.scenario, addContractor: true, deadlineExtensionDays: 7, capacityMultiplier: 1.08 } });
  return [
    { id: "baseline", label: "Current plan", note: "Existing team and target deadline", plan: baseline },
    { id: "contractor", label: "Add specialist", note: "Temporary multi-skill contractor added", plan: contractor },
    { id: "extension", label: "Extend deadline", note: "Keep team, add two calendar weeks", plan: extension },
    { id: "balanced", label: "Balanced recovery", note: "Add specialist and a short extension", plan: balanced },
  ];
}

export function planToText(project, plan) {
  const lines = [
    "ELITE ERA DEVELOPMENT L.L.C — DELIVERY INTELLIGENCE REPORT",
    "Made by Hira Khyzer",
    `Project: ${project.name}`,
    `Client: ${project.client}`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "--- DELIVERY HEALTH ---",
    `Health: ${plan.risk.health}`,
    `Risk score: ${plan.risk.score}/100`,
    `Projected completion: ${plan.completionDate}`,
    `Target deadline: ${plan.deadline}`,
    `Deadline slip: ${plan.slipDays} days`,
    "",
    "--- COMMERCIAL FORECAST ---",
    `Contract value: ${money(project.contractValue)}`,
    `Forecast delivery cost: ${money(plan.forecastCost)}`,
    `Expected profit: ${money(plan.profit)}`,
    `Expected margin: ${plan.margin.toFixed(1)}%`,
    "",
    "--- TASK PLAN ---",
    ...plan.schedule.map((task) => `${task.title} | ${task.assignee} | ${task.start} → ${task.finish} | ${task.plannedHours}h | ${money(task.cost)}`),
    "",
    "--- RECOMMENDATIONS ---",
    ...plan.recommendations.map((item) => `${item.title}: ${item.detail}`),
  ];
  return `${lines.join("\n")}\n`;
}

export function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
