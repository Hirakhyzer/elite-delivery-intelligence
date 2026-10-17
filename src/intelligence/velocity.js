export function velocityTrend(periods) {
  if (!periods.length) return { average: 0, latest: 0, trend: "Stable", delta: 0 };
  const values = periods.map((period) => Number(period.completed || 0));
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const delta = values.at(-1) - values[0];
  return { average, latest: values.at(-1), delta, trend: delta > 2 ? "Accelerating" : delta < -2 ? "Slowing" : "Stable" };
}
