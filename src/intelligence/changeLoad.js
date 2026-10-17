export function changeLoad(changes, plannedHours) {
  const addedHours = changes.reduce((sum, change) => sum + Number(change.hours || 0), 0);
  const ratio = plannedHours > 0 ? addedHours / plannedHours : 0;
  const score = Math.min(100, Math.round(ratio * 100 + changes.length * 3));
  return { addedHours, ratio, score, band: score >= 60 ? "High" : score >= 30 ? "Watch" : "Low" };
}
