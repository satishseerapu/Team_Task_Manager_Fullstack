import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasksByProject } from '../store/slices/tasksSlice';
import { fetchProjects } from '../store/slices/projectsSlice';
import { fetchOrgStats } from '../store/slices/statsSlice';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/ui/StatCard';
import TaskStatusPieChart from '../components/dashboard/TaskStatusPieChart';
import TasksPerProjectChart from '../components/dashboard/TasksPerProjectChart';
import MyTasksList from '../components/dashboard/MyTasksList';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const { stats, loading } = useDashboard();
  const allProjectTasks = useSelector((state) => state.tasks.allProjectTasks);
  const fetchedProjectIds = useSelector((state) => state.tasks.fetchedProjectIds);
  const projects = useSelector((state) => state.projects.list);
  const orgStats = useSelector((state) => state.stats.orgStats);
  const orgStatsLoading = useSelector((state) => state.stats.loading);

  useEffect(() => {
    const load = async () => {
      if (!projects.length) {
        try { await dispatch(fetchProjects()).unwrap(); }
        catch (err) { toast.show(typeof err === 'string' ? err : 'Failed to load projects', 'error'); }
      }
      if (isAdmin) {
        try { await dispatch(fetchOrgStats()).unwrap(); }
        catch (err) { toast.show(typeof err === 'string' ? err : 'Failed to load org stats', 'error'); }
      }
    };
    load();
  }, [dispatch, isAdmin, projects.length]);

  useEffect(() => {
    if (!projects.length) return;
    projects.forEach((project) => {
      if (!fetchedProjectIds.includes(project._id)) {
        dispatch(fetchTasksByProject(project._id))
          .unwrap()
          .catch((err) => toast.show(typeof err === 'string' ? err : 'Failed to load tasks', 'error'));
      }
    });
  }, [dispatch, projects, fetchedProjectIds]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your projects today.</p>
      </div>

      {/* Admin: org-wide overview */}
      {isAdmin && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Organization Overview</h2>
          {orgStatsLoading ? (
            <div className="flex justify-center py-6"><LoadingSpinner /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                label="Total Org Tasks"
                value={orgStats?.totalTasks}
                color="purple"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>}
              />
              <StatCard
                label="Total Projects"
                value={orgStats?.totalProjects}
                color="purple"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>}
              />
              <StatCard
                label="Total Members"
                value={orgStats?.totalMembers}
                color="purple"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>}
              />
              <StatCard
                label="Org Overdue"
                value={orgStats?.overdueTasks}
                color="red"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>}
              />
            </div>
          )}
        </div>
      )}

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">My Work</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={stats?.totalTasks}
          color="primary"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7l2 2 4-4" />
          </svg>}
        />
        <StatCard
          label="In Progress"
          value={stats?.statusCounts?.in_progress}
          color="primary"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>}
        />
        <StatCard
          label="Completed"
          value={stats?.statusCounts?.done}
          color="green"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
        />
        <StatCard
          label="Overdue"
          value={stats?.overdueTasks}
          color="red"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
        />
      </div>

      {/* Admin: tasks per member table */}
      {isAdmin && orgStats?.tasksPerUser?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Tasks per Member</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 font-medium text-gray-500">Member</th>
                  <th className="pb-2 font-medium text-gray-500 text-right">Tasks Assigned</th>
                </tr>
              </thead>
              <tbody>
                {orgStats.tasksPerUser.map((row) => (
                  <tr key={String(row._id)} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 text-gray-800">{row.name}</td>
                    <td className="py-2 text-right">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs">
                        {row.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Tasks by Status</h2>
          <div className="h-56">
            {loading ? (
              <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
            ) : (
              <TaskStatusPieChart statusCounts={stats?.statusCounts ?? {}} />
            )}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Tasks per Project</h2>
          <div className="h-56">
            {loading ? (
              <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
            ) : (
              <TasksPerProjectChart projectStats={stats?.projectStats ?? []} />
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">My Tasks</h2>
        <MyTasksList tasks={allProjectTasks} />
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
