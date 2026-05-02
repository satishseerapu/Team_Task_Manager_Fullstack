import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useDashboard() {
  const allProjectTasks = useSelector((state) => state.tasks.allProjectTasks);
  const projects = useSelector((state) => state.projects.list);
  const loading = useSelector((state) => state.tasks.loading);
  const error = useSelector((state) => state.tasks.error);

  const stats = useMemo(() => {
    const now = new Date();
    const projectNameMap = Object.fromEntries(projects.map((p) => [p._id, p.name]));

    const STATUS_KEY = { 'To Do': 'todo', 'In Progress': 'in_progress', 'Done': 'done' };
    const statusCounts = { todo: 0, in_progress: 0, done: 0 };
    allProjectTasks.forEach((t) => {
      const key = STATUS_KEY[t.status] ?? t.status.toLowerCase().replace(/\s+/g, '_');
      statusCounts[key] = (statusCounts[key] ?? 0) + 1;
    });

    const overdueTasks = allProjectTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done'
    ).length;

    const projectMap = {};
    allProjectTasks.forEach((t) => {
      const projectId = t.project?._id ?? t.project;
      const name = t.project?.name ?? projectNameMap[projectId] ?? 'Unknown';
      if (!projectMap[name]) projectMap[name] = { total: 0, done: 0 };
      projectMap[name].total += 1;
      if (t.status === 'Done') projectMap[name].done += 1;
    });
    const projectStats = Object.entries(projectMap).map(([name, { total, done }]) => ({ name, total, done }));

    return { totalTasks: allProjectTasks.length, statusCounts, overdueTasks, projectStats };
  }, [allProjectTasks]);

  return { stats, loading, error };
}
