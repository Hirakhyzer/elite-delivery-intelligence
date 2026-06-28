import { useEffect, useMemo, useState } from "react";
import { cloneInitialState } from "./data";
import { buildScenarioComparisons, createDeliveryPlan, downloadFile, planToText } from "./engine";
import { Button } from "./ui";
import { Overview } from "./views/Overview";
import { Planner } from "./views/Planner";
import { Team } from "./views/Team";
import { Scenarios } from "./views/Scenarios";
import { Reports } from "./views/Reports";

const STORAGE_KEY = "elite-delivery-intelligence-v1";
const copy = (value) => JSON.parse(JSON.stringify(value));

function loadState() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    const fresh = cloneInitialState();
    return saved ? { ...fresh, ...saved, project: { ...fresh.project, ...saved.project }, scenario: { ...fresh.scenario, ...saved.scenario }, employees: Array.isArray(saved.employees) ? saved.employees : fresh.employees, tasks: Array.isArray(saved.tasks) ? saved.tasks : fresh.tasks, savedPlans: Array.isArray(saved.savedPlans) ? saved.savedPlans : [] } : fresh;
  } catch {
    return cloneInitialState();
  }
}

export default function App() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState("overview");
  const [toast, setToast] = useState("");
  const plan = useMemo(() => createDeliveryPlan(state), [state]);
  const comparisons = useMemo(() => buildScenarioComparisons(state), [state]);

  useEffect(() => { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);
  useEffect(() => { if (!toast) return undefined; const timer = window.setTimeout(() => setToast(""), 2600); return () => window.clearTimeout(timer); }, [toast]);
  const notify = (message) => setToast(message);

  function updateProject(changes) { setState((current) => ({ ...current, project: { ...current.project, ...changes } })); }
  function updateScenario(changes) { setState((current) => ({ ...current, scenario: { ...current.scenario, ...changes } })); }
  function updateTask(id, changes) { setState((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, ...changes } : task) })); }
  function updateEmployee(id, changes) { setState((current) => ({ ...current, employees: current.employees.map((employee) => employee.id === id ? { ...employee, ...changes } : employee) })); }
  function addTask(task) { setState((current) => ({ ...current, tasks: [...current.tasks, { ...task, id: `task-${Date.now()}` }] })); notify("Task added and plan recalculated"); }
  function addEmployee(employee) { setState((current) => ({ ...current, employees: [...current.employees, { ...employee, id: `employee-${Date.now()}` }] })); notify("Employee added to capacity plan"); }

  function applyAssignments() {
    setState((current) => {
      const suggested = createDeliveryPlan(current);
      const assignmentMap = Object.fromEntries(suggested.schedule.map((task) => [task.id, task.assigneeId]));
      return { ...current, tasks: current.tasks.map((task) => ({ ...task, assigneeId: task.status === "Done" ? task.assigneeId : assignmentMap[task.id] || task.assigneeId })) };
    });
    notify("Smart assignments applied to all active tasks");
  }

  function applyScenario(id) {
    const base = state.scenario;
    const next = {
      baseline: { ...base, addContractor: false, deadlineExtensionDays: 0, capacityMultiplier: 1 },
      contractor: { ...base, addContractor: true },
      extension: { ...base, addContractor: false, deadlineExtensionDays: 14 },
      balanced: { ...base, addContractor: true, deadlineExtensionDays: 7, capacityMultiplier: 1.08 },
    }[id];
    if (!next) return;
    updateScenario(next);
    notify(`${id === "baseline" ? "Baseline" : id === "contractor" ? "Contractor" : id === "extension" ? "Deadline extension" : "Balanced recovery"} scenario applied`);
  }

  function savePlan() {
    const snapshot = { id: `plan-${Date.now()}`, createdAt: new Date().toLocaleString(), projectName: state.project.name, health: plan.risk.health, completionDate: plan.completionDate, forecastCost: plan.forecastCost, margin: plan.margin, risk: plan.risk.score };
    setState((current) => ({ ...current, savedPlans: [snapshot, ...current.savedPlans].slice(0, 15) }));
    notify("Delivery plan snapshot saved");
  }

  function removePlan(id) { setState((current) => ({ ...current, savedPlans: current.savedPlans.filter((planItem) => planItem.id !== id) })); notify("Saved snapshot removed"); }
  function exportJson() { downloadFile("elite-delivery-plan.json", JSON.stringify({ generatedAt: new Date().toLocaleString(), brand: "Elite Era Development L.L.C", project: state.project, employees: state.employees, tasks: state.tasks, scenario: state.scenario, plan }, null, 2), "application/json"); notify("JSON plan downloaded"); }
  function exportText() { downloadFile("elite-delivery-report.txt", planToText(state.project, plan), "text/plain"); notify("Delivery report downloaded"); }
  function resetWorkspace() { if (!window.confirm("Reset all delivery planning data in this browser?")) return; setState(cloneInitialState()); setTab("overview"); notify("Demo workspace reset"); }

  const tabs = [
    ["overview", "Command center", "◆"],
    ["planner", "Task planner", "◫"],
    ["team", "Team capacity", "◉"],
    ["scenarios", "Scenarios", "↗"],
    ["reports", "Reports", "▤"],
  ];
  const common = { state, plan, setTab, updateProject, updateScenario, updateTask, updateEmployee, addTask, addEmployee, applyAssignments, comparisons, applyScenario, savePlan, removePlan, exportJson, exportText, resetWorkspace };
  const pages = {
    overview: <Overview {...common}/>,
    planner: <Planner {...common}/>,
    team: <Team {...common}/>,
    scenarios: <Scenarios {...common}/>,
    reports: <Reports {...common}/>,
  };

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">E</div><div><span>Elite Era Development L.L.C</span><strong>Delivery Intelligence</strong></div></div><nav>{tabs.map(([id, label, icon]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><i>{icon}</i>{label}</button>)}</nav><div className="side-card"><span>Active project</span><strong>{state.project.client}</strong><small>{state.project.priority} priority · {state.project.clientTier} tier</small><div className="side-health"><i className={plan.risk.health === "On track" ? "good" : plan.risk.health === "At risk" ? "watch" : "risk"}/><b>{plan.risk.health}</b><em>{plan.risk.score}/100</em></div></div><div className="side-profile"><span className="profile-avatar">HK</span><div><strong>Hira Khyzer</strong><small>Founder · Elite Era</small></div></div></aside>
    <main className="workspace"><header className="topbar"><div><p className="eyebrow">Project delivery operating system</p><h2>{state.project.name}</h2></div><div className="topbar-actions"><span className="autosave">● Saved locally</span><Button variant="outline" onClick={exportText}>Export report</Button><Button onClick={applyAssignments}>Auto-plan team</Button></div></header><div className="mobile-tabs">{tabs.map(([id, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>)}</div><section className="workspace-content">{pages[tab]}</section><footer className="footer"><strong>Made by Hira Khyzer</strong><span>Elite Era Development L.L.C</span><b>#f4af00</b></footer></main>{toast && <div className="toast">{toast}</div>}
  </div>;
}
