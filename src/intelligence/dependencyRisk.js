export function dependencyRisk(dependencies) {
  return dependencies.map((dependency) => {
    const score = Math.min(100, Number(dependency.delayDays || 0) * 7 + Number(dependency.downstreamTasks || 0) * 9 + (dependency.external ? 15 : 0));
    return { ...dependency, score, band: score >= 70 ? "Critical" : score >= 45 ? "High" : score >= 20 ? "Watch" : "Low" };
  }).sort((a, b) => b.score - a.score);
}
