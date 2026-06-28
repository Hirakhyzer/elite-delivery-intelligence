import { dateLabel, money, percent } from "../engine";
import { Badge, Button, Metric, PageHeading, Panel, Progress } from "../ui";

const healthTone = (health) => health === "On track" ? "success" : health === "At risk" ? "warning" : "danger";

export function Overview({ state, plan, setTab, applyAssignments }) {
  const { project } = state;
  const health = healthTone(plan.risk.health);
  return <div className="page">
    <PageHeading eyebrow="Elite Era Development L.L.C" title="Delivery command center" text="Plan delivery capacity before project risk becomes a client problem." action={<Button onClick={applyAssignments}>Apply smart assignments</Button>}/>
    <section className={`health-hero ${health}`}>
      <div>
        <p className="eyebrow">Project delivery health</p>
        <h2>{project.name}</h2>
        <p>{project.client} · {project.service} · {project.clientTier} client · Target {dateLabel(plan.deadline)}</p>
        <div className="hero-actions"><Button onClick={() => setTab("planner")}>Open task planner →</Button><Button variant="outline" onClick={() => setTab("scenarios")}>Compare recovery scenarios</Button></div>
      </div>
      <div className="risk-orbit"><div><strong>{plan.risk.score}</strong><span>risk score</span><Badge tone={health}>{plan.risk.health}</Badge></div></div>
    </section>
    <div className="metric-grid">
      <Metric label="Forecast cost" value={money(plan.forecastCost)} detail={`${Math.round(plan.forecastCost / project.contractValue * 100)}% of contract value`} icon="◌"/>
      <Metric label="Expected profit" value={money(plan.profit)} detail={`${plan.margin.toFixed(1)}% project margin`} tone={plan.margin >= 30 ? "success" : "warning"} icon="◆"/>
      <Metric label="Completion forecast" value={dateLabel(plan.completionDate)} detail={plan.slipDays ? `${plan.slipDays} days after target` : "Within target window"} tone={plan.slipDays ? "danger" : "blue"} icon="◷"/>
      <Metric label="Team capacity" value={`${plan.overbookedEmployees.length}/${plan.employeeStats.length}`} detail={plan.overbookedEmployees.length ? "Overbooked employees" : "No overload detected"} tone={plan.overbookedEmployees.length ? "danger" : "ink"} icon="◫"/>
    </div>
    <div className="overview-grid">
      <Panel eyebrow="Recommended actions" title="Delivery intelligence"><div className="recommendation-list">{plan.recommendations.map((item, index) => <article key={`${item.type}-${index}`} className={item.type}><i>{item.type === "success" ? "✓" : item.type === "blocker" ? "!" : item.type === "deadline" ? "◷" : "↗"}</i><div><strong>{item.title}</strong><p>{item.detail}</p></div></article>)}</div></Panel>
      <Panel eyebrow="Commercial position" title="Budget protection"><div className="budget-visual"><div className="budget-label"><span>Forecast delivery cost</span><strong>{money(plan.forecastCost)}</strong></div><Progress value={plan.forecastCost / project.contractValue * 100} tone={plan.forecastCost / project.contractValue > .9 ? "red" : "gold"}/><div className="budget-foot"><span>Contract value {money(project.contractValue)}</span><b>{money(plan.profit)} retained</b></div></div><div className="cost-lines"><span>Labor forecast <b>{money(plan.laborCost)}</b></span><span>Fixed delivery costs <b>{money(project.fixedCosts)}</b></span><span>Risk reserve <b>{money(plan.riskReserve)}</b></span></div></Panel>
    </div>
    <div className="overview-grid">
      <Panel eyebrow="Critical chain" title="Tasks that control delivery date"><div className="critical-list">{plan.criticalTasks.slice(0, 5).map((task) => <article key={task.id}><div><Badge tone={task.status === "Blocked" ? "danger" : task.late ? "warning" : "neutral"}>{task.status}</Badge><strong>{task.title}</strong><small>{task.assignee} · {task.plannedHours}h · {dateLabel(task.finish)}</small></div><span>{task.dependencies.length} dependencies</span></article>)}</div><Button variant="outline" onClick={() => setTab("planner")}>Manage task plan</Button></Panel>
      <Panel eyebrow="Capacity signal" title="Team load forecast"><div className="capacity-list">{plan.employeeStats.map((employee) => <article key={employee.id}><div className="employee-head"><span className="mini-avatar">{employee.initials}</span><div><strong>{employee.name}</strong><small>{employee.role}</small></div><b>{percent(employee.utilization)}</b></div><Progress value={employee.utilization} tone={employee.overbooked ? "red" : employee.utilization > 82 ? "gold" : "green"}/><small>{Math.round(employee.plannedHours)}h planned · next availability {dateLabel(employee.nextAvailable)}</small></article>)}</div></Panel>
    </div>
  </div>;
}
