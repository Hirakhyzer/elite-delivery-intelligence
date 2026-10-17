export function forecastError(observations) {
  if (!observations.length) return { mae: 0, bias: 0, count: 0 };
  const errors = observations.map((row) => Number(row.actual || 0) - Number(row.forecast || 0));
  const mae = errors.reduce((sum, error) => sum + Math.abs(error), 0) / errors.length;
  const bias = errors.reduce((sum, error) => sum + error, 0) / errors.length;
  return { mae, bias, count: errors.length, direction: bias > 1 ? "Under-forecasting" : bias < -1 ? "Over-forecasting" : "Balanced" };
}
