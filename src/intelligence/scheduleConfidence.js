export function scheduleConfidence(project) {
  const progress = Number(project.progress || 0);
  const planned = Number(project.plannedProgress || 0);
  const blockers = Number(project.blockers || 0);
  const slip = Math.max(0, planned - progress);
  const score = Math.max(0, Math.min(100, Math.round(100 - slip * 1.2 - blockers * 12)));
  return { score, slip, band: score >= 80 ? "High" : score >= 60 ? "Medium" : score >= 40 ? "Low" : "Critical" };
}
