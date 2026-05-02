import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useDashboard() {
  const allProjectTasks = useSelector((state) => state.tasks.allProjectTasks);
  const loading = useSelector((state) => state.tasks.loading);
  const error = useSelector((state) => state.tasks.error);

  const stats = useMemo(() => {
    const now = new Date();

    const statusCounts = allProjectTasks.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    }, {});
    statusCounts.in_progress = statusCounts['In Progress'] ?? 0;
    statusCounts.done = statusCounts['Done'] ?? 0;

    const overdueTasks = allProjectTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done'
    ).length;

    const projectMap = {};
    allProjectTasks.forEach((t) => {
      const name = t.project?.name ?? t.project ?? 'Unknown';
      projectMap[name] = (projectMap[name] ?? 0) + 1;
    });
    const projectStats = Object.entries(projectMap).map(([name, count]) => ({ name, count }));

    return { totalTasks: allProjectTasks.length, statusCounts, overdueTasks, projectStats };
  }, [allProjectTasks]);

  return { stats, loading, error };
}
