export function criticalPath(tasks) {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const memo = new Map();
  const duration = (id, visiting = new Set()) => {
    if (memo.has(id)) return memo.get(id);
    if (visiting.has(id)) throw new Error("task dependency cycle detected");
    visiting.add(id);
    const task = byId.get(id);
    if (!task) return 0;
    const upstream = (task.dependencies || []).map((dep) => duration(dep, new Set(visiting)));
    const value = Number(task.durationDays || 0) + Math.max(0, ...upstream);
    memo.set(id, value); return value;
  };
  const rows = tasks.map((task) => ({ id: task.id, finishDay: duration(task.id) }));
  return { durationDays: Math.max(0, ...rows.map((row) => row.finishDay)), rows };
}
