import { describe, expect, it } from "vitest";
import { cloneInitialState } from "./data";
import { buildScenarioComparisons, createDeliveryPlan, topologicalTasks } from "./engine";

describe("delivery intelligence engine", () => {
  it("creates a planned schedule with cost, risk, and assignments", () => {
    const state = cloneInitialState();
    const plan = createDeliveryPlan(state);
    expect(plan.schedule).toHaveLength(state.tasks.length);
    expect(plan.forecastCost).toBeGreaterThan(state.project.fixedCosts);
    expect(plan.employeeStats.length).toBeGreaterThan(0);
    expect(plan.risk.score).toBeGreaterThanOrEqual(0);
  });

  it("orders dependency tasks before their dependent work", () => {
    const state = cloneInitialState();
    const order = topologicalTasks(state.tasks).order.map((task) => task.id);
    expect(order.indexOf("t-architecture")).toBeLessThan(order.indexOf("t-integrations"));
    expect(order.indexOf("t-qa")).toBeLessThan(order.indexOf("t-uat"));
  });

  it("assigns tasks to people with matching skills", () => {
    const state = cloneInitialState();
    const plan = createDeliveryPlan(state);
    const aiTask = plan.schedule.find((task) => task.id === "t-ai");
    expect(aiTask.assignee).toBeTruthy();
    expect(aiTask.skillMatch).toBeGreaterThan(0);
  });

  it("creates multiple recovery comparisons", () => {
    const state = cloneInitialState();
    const comparisons = buildScenarioComparisons(state);
    expect(comparisons).toHaveLength(4);
    expect(comparisons.map((item) => item.id)).toContain("balanced");
  });

  it("raises commercial pressure for a very low contract value", () => {
    const state = cloneInitialState();
    state.project.contractValue = 4000;
    const plan = createDeliveryPlan(state);
    expect(plan.risk.budgetRisk).toBeGreaterThan(0);
  });
});
