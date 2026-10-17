export function portfolioRisk(projects) {
  if (!projects.length) return { score: 0, highRisk: [], exposure: 0 };
  const weighted = projects.map((project) => ({ id: project.id, risk: Number(project.riskScore || 0), value: Number(project.value || 0) }));
  const exposure = weighted.reduce((sum, row) => sum + row.value, 0);
  const score = exposure ? weighted.reduce((sum, row) => sum + row.risk * row.value, 0) / exposure : weighted.reduce((sum, row) => sum + row.risk, 0) / weighted.length;
  return { score: Math.round(score), highRisk: weighted.filter((row) => row.risk >= 65).map((row) => row.id), exposure };
}
