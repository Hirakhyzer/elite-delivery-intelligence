export function milestoneRisk(milestone) {
  const remaining = Math.max(0, Number(milestone.remainingHours || 0));
  const capacity = Math.max(1, Number(milestone.availableHours || 0));
  const pressure = remaining / capacity;
  const dependencies = Number(milestone.openDependencies || 0);
  const score = Math.min(100, Math.round(pressure * 55 + dependencies * 12));
  return { pressure, score, band: score >= 75 ? "Critical" : score >= 50 ? "High" : score >= 25 ? "Watch" : "Low" };
}
