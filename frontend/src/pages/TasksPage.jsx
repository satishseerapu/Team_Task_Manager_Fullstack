import { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchTasksByProject, createTask, updateTask, deleteTask, updateTaskStatus } from '../store/slices/tasksSlice';
import { fetchProjects } from '../store/slices/projectsSlice';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import TaskFilters from '../components/tasks/TaskFilters';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

export default function TasksPage() {
  const dispatch = useDispatch();
  const allProjectTasks = useSelector((state) => state.tasks.allProjectTasks);
  const fetchedProjectIds = useSelector((state) => state.tasks.fetchedProjectIds);
  const tasks = allProjectTasks;
  const loading = useSelector((state) => state.tasks.loading);

  const [filters, setFilters] = useState({ search: '', status: '', projectId: '', priority: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);

  const projects = useSelector((state) => state.projects.list);
  const { isAdmin } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (!projects.length) dispatch(fetchProjects());
  }, [dispatch, projects.length]);

  useEffect(() => {
    if (!projects.length) return;
    projects.forEach((project) => {
      if (!fetchedProjectIds.includes(project._id)) {
        dispatch(fetchTasksByProject(project._id));
      }
    });
  }, [dispatch, projects, fetchedProjectIds]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.status && t.status !== filters.status) return false;
      if (filters.projectId && (t.project?._id ?? t.project) !== filters.projectId) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      return true;
    });
  }, [tasks, filters]);

  async function handleSave(data) {
    if (!isAdmin && !editingTask) {
      setSaving(false);
      return;
    }
    setSaving(true);
    try {
      if (editingTask) {
        await dispatch(updateTask({ id: editingTask._id, payload: data })).unwrap();
        toast.show('Task updated successfully', 'success');
      } else {
        await dispatch(createTask(data)).unwrap();
        toast.show('Task created successfully', 'success');
      }
      setShowForm(false);
      setEditingTask(null);
    } catch (err) {
      toast.show(err ?? 'Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(taskId, status) {
    try {
      await dispatch(updateTaskStatus({ id: taskId, status })).unwrap();
    } catch (err) {
      toast.show(err ?? 'Failed to update status', 'error');
    }
  }

  async function handleDelete(taskId) {
    if (!window.confirm('Delete this task?')) return;
    try {
      await dispatch(deleteTask(taskId)).unwrap();
      toast.show('Task deleted', 'success');
    } catch (err) {
      toast.show(err ?? 'Failed to delete task', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} of {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditingTask(null); setShowForm(true); }} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        )}
      </div>

      <TaskFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title={tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}
          description={tasks.length === 0 ? 'Create your first task to get started.' : 'Try adjusting your filters.'}
          action={tasks.length === 0 && isAdmin && <button onClick={() => setShowForm(true)} className="btn-primary">Create task</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusChange={handleStatusChange}
              onEdit={isAdmin ? (t) => { setEditingTask(t); setShowForm(true); } : undefined}
              onDelete={isAdmin ? handleDelete : undefined}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingTask(null); }}
        title={editingTask ? 'Edit task' : 'New task'}
      >
        <TaskForm
          initialData={
            editingTask
              ? {
                  ...editingTask,
                  projectId: editingTask.project?._id ?? editingTask.project ?? '',
                  assigneeId:
                    editingTask.assignee?._id ??
                    editingTask.assignee ??
                    editingTask.assignedTo?._id ??
                    editingTask.assignedTo ??
                    '',
                }
              : {}
          }
          onSubmit={handleSave}
          onCancel={() => { setShowForm(false); setEditingTask(null); }}
          loading={saving}
        />
      </Modal>
    </div>
  );
}
