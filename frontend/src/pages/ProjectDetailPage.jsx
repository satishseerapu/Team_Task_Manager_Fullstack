import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectById, addProjectMember, removeProjectMember } from '../store/slices/projectsSlice';
import { fetchTasksByProject, createTask, updateTask, deleteTask, updateTaskStatus } from '../store/slices/tasksSlice';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import AddMemberForm from '../components/projects/AddMemberForm';
import Avatar from '../components/ui/Avatar';
import { RoleBadge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/ui/EmptyState';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { isAdmin } = useAuth();
  const toast = useToast();

  const project = useSelector((state) => state.projects.currentProject);
  const tasks = useSelector((state) => state.tasks.projectTasks);
  const loading = useSelector((state) => state.projects.loading);
  const error = useSelector((state) => state.projects.error);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [savingTask, setSavingTask] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    dispatch(fetchProjectById(id));
    dispatch(fetchTasksByProject(id));
  }, [dispatch, id]);

  async function handleSaveTask(data) {
    setSavingTask(true);
    try {
      if (editingTask) {
        await dispatch(updateTask({ id: editingTask._id, payload: data })).unwrap();
        toast.show('Task updated successfully', 'success');
      } else {
        await dispatch(createTask({ ...data, project: id })).unwrap();
        toast.show('Task created successfully', 'success');
      }
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (err) {
      toast.show(typeof err === 'string' ? err : 'Failed to save task', 'error');
    } finally {
      setSavingTask(false);
    }
  }

  async function handleStatusChange(taskId, status) {
    try {
      await dispatch(updateTaskStatus({ id: taskId, status })).unwrap();
    } catch (err) {
      toast.show(typeof err === 'string' ? err : 'Failed to update status', 'error');
    }
  }

  async function handleDeleteTask(taskId) {
    if (!window.confirm('Delete this task?')) return;
    try {
      await dispatch(deleteTask(taskId)).unwrap();
      toast.show('Task deleted', 'success');
    } catch (err) {
      toast.show(typeof err === 'string' ? err : 'Failed to delete task', 'error');
    }
  }

  async function handleAddMember(userId) {
    setAddingMember(true);
    try {
      await dispatch(addProjectMember({ projectId: id, userId })).unwrap();
      toast.show('Member added to project', 'success');
    } catch (err) {
      toast.show(typeof err === 'string' ? err : 'Failed to add member', 'error');
    } finally {
      setAddingMember(false);
    }
  }

  async function handleRemoveMember(userId) {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await dispatch(removeProjectMember({ projectId: id, userId })).unwrap();
      toast.show('Member removed from project', 'success');
    } catch (err) {
      toast.show(typeof err === 'string' ? err : 'Failed to remove member', 'error');
    }
  }

  if (loading && !project) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (error) return <ErrorMessage message={error} onRetry={() => { dispatch(fetchProjectById(id)); dispatch(fetchTasksByProject(id)); }} />;
  if (!project) return null;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mb-2 w-fit">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Projects
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.description && <p className="text-sm text-gray-500 mt-1">{project.description}</p>}
          </div>
          {isAdmin && (
            <button
              onClick={() => { setEditingTask(null); setShowTaskForm(true); }}
              className="btn-primary flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Tasks ({tasks.length})</h2>
          {tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description="Add your first task to this project."
              action={<button onClick={() => setShowTaskForm(true)} className="btn-primary">Add task</button>}
            />
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onEdit={isAdmin ? (t) => { setEditingTask(t); setShowTaskForm(true); } : undefined}
                  onDelete={isAdmin ? handleDeleteTask : undefined}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Members ({project.members?.length ?? 0})
            </h2>

            {isAdmin && (
              <div className="mb-4">
                <AddMemberForm
                  projectId={id}
                  existingMemberIds={(project.members ?? []).map((m) => m._id)}
                  onAdd={handleAddMember}
                  loading={addingMember}
                />
              </div>
            )}

            <div className="space-y-3">
              {(project.members ?? []).map((m) => (
                <div key={m._id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={m.name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                      <p className="text-xs text-gray-400 truncate">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <RoleBadge role={m.role} />
                    {isAdmin && (
                      <button
                        onClick={() => handleRemoveMember(m._id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showTaskForm}
        onClose={() => { setShowTaskForm(false); setEditingTask(null); }}
        title={editingTask ? 'Edit task' : 'New task'}
      >
        <TaskForm
          initialData={
            editingTask
              ? {
                  ...editingTask,
                  projectId: editingTask.project?._id ?? editingTask.project ?? id,
                  assigneeId:
                    editingTask.assignee?._id ??
                    editingTask.assignee ??
                    editingTask.assignedTo?._id ??
                    editingTask.assignedTo ??
                    '',
                }
              : { projectId: id }
          }
          onSubmit={handleSaveTask}
          onCancel={() => { setShowTaskForm(false); setEditingTask(null); }}
          loading={savingTask}
        />
      </Modal>
    </div>
  );
}
