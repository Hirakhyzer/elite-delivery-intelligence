export function blockerAging(blockers, today = new Date().toISOString().slice(0, 10)) {
  return blockers.map((blocker) => {
    const days = Math.max(0, Math.round((new Date(`${today}T12:00:00`) - new Date(`${blocker.opened}T12:00:00`)) / 86400000));
    const score = Math.min(100, days * 8 + (blocker.critical ? 30 : 0));
    return { ...blocker, days, score, stale: days >= 5 };
  }).sort((a, b) => b.score - a.score);
}
