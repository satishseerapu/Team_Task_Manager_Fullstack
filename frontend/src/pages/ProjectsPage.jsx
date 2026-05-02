import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, createProject, deleteProject } from '../store/slices/projectsSlice';
import { fetchTasksByProject } from '../store/slices/tasksSlice';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectForm from '../components/projects/ProjectForm';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/ui/EmptyState';

export default function ProjectsPage() {
  const dispatch = useDispatch();
  const { isAdmin } = useAuth();
  const toast = useToast();
  const projects = useSelector((state) => state.projects.list);
  const allProjectTasks = useSelector((state) => state.tasks.allProjectTasks);
  const fetchedProjectIds = useSelector((state) => state.tasks.fetchedProjectIds);
  const loading = useSelector((state) => state.projects.loading);
  const error = useSelector((state) => state.projects.error);

  const projectsWithTaskCount = useMemo(() => {
    const countMap = {};
    allProjectTasks.forEach((t) => {
      const pid = t.project?._id ?? t.project;
      if (pid) countMap[pid] = (countMap[pid] ?? 0) + 1;
    });
    return projects.map((p) => ({ ...p, taskCount: countMap[p._id] ?? p.taskCount ?? 0 }));
  }, [projects, allProjectTasks]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!projects.length) dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    projects.forEach((p) => {
      if (!fetchedProjectIds.includes(p._id)) dispatch(fetchTasksByProject(p._id));
    });
  }, [dispatch, projects, fetchedProjectIds]);

  async function handleCreate(data) {
    setCreating(true);
    try {
      await dispatch(createProject(data)).unwrap();
      setShowCreate(false);
      toast.show('Project created successfully', 'success');
    } catch (err) {
      toast.show(typeof err === 'string' ? err : 'Failed to create project', 'error');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try {
      await dispatch(deleteProject(id)).unwrap();
      toast.show('Project deleted', 'success');
    } catch (err) {
      toast.show(typeof err === 'string' ? err : 'Failed to delete project', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">{projectsWithTaskCount.length} project{projectsWithTaskCount.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} onRetry={() => dispatch(fetchProjects())} />}

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : projectsWithTaskCount.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          title="No projects yet"
          description={isAdmin ? 'Create your first project to get started.' : "You haven't been added to any projects yet."}
          action={isAdmin && <button onClick={() => setShowCreate(true)} className="btn-primary">Create project</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projectsWithTaskCount.map((project) => (
            <ProjectCard key={project._id} project={project} isAdmin={isAdmin} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create new project">
        <ProjectForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={creating} />
      </Modal>
    </div>
  );
}
