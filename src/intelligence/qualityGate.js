export function qualityGate(release) {
  const blockers = Number(release.blockingDefects || 0);
  const coverage = Number(release.testCoverage || 0);
  const passRate = Number(release.testPassRate || 0);
  const ready = blockers === 0 && coverage >= 70 && passRate >= 95;
  const reasons = [];
  if (blockers) reasons.push(`${blockers} blocking defects`);
  if (coverage < 70) reasons.push("test coverage below 70%");
  if (passRate < 95) reasons.push("test pass rate below 95%");
  return { ready, reasons };
}
