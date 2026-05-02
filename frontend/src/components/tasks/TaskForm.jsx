import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import { useSelector } from 'react-redux';
import projectService from '../../services/projectService';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const EMPTY = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  projectId: '',
  assigneeId: '',
  dueDate: '',
};

export default function TaskForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ ...EMPTY, ...initialData });
  const [errors, setErrors] = useState({});
  const projects = useSelector((state) => state.projects.list);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (!form.projectId) {
      setMembers([]);
      return;
    }
    setLoadingMembers(true);
    projectService.getById(form.projectId)
      .then((d) => setMembers((d.project ?? d).members ?? []))
      .catch(() => setMembers([]))
      .finally(() => setLoadingMembers(false));
  }, [form.projectId]);

  function set(field, value) {
    setForm((f) => ({
      ...f,
      [field]: value,
      ...(field === 'projectId' ? { assigneeId: '' } : {}),
    }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    // Map form status values to backend expected values
    const statusMap = {
      'todo': 'To Do',
      'in_progress': 'In Progress',
      'review': 'In Review',
      'done': 'Done',
    };
    
    const payload = {
      ...form,
      status: statusMap[form.status] || form.status,
      projectId: form.projectId,
      assignedTo: form.assigneeId || undefined,
    };
    delete payload.assigneeId;
    onSubmit(payload);
  }

  const projectOptions = [
    { value: '', label: 'No project' },
    ...projects.map((p) => ({ value: p._id, label: p.name })),
  ];

  const memberOptions = [
    { value: '', label: form.projectId ? (loadingMembers ? 'Loading…' : 'Unassigned') : 'Select a project first' },
    ...members.map((m) => ({ value: m._id, label: m.name })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task title *"
        id="task-title"
        placeholder="Enter task title"
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        error={errors.title}
      />

      <Textarea
        label="Description"
        id="task-desc"
        placeholder="Describe the task..."
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Status"
          id="task-status"
          options={STATUS_OPTIONS}
          value={form.status}
          onChange={(e) => set('status', e.target.value)}
        />
        <Select
          label="Priority"
          id="task-priority"
          options={PRIORITY_OPTIONS}
          value={form.priority}
          onChange={(e) => set('priority', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Project"
          id="task-project"
          options={projectOptions}
          value={form.projectId}
          onChange={(e) => set('projectId', e.target.value)}
        />
        <Select
          label="Assignee"
          id="task-assignee"
          options={memberOptions}
          value={form.assigneeId}
          onChange={(e) => set('assigneeId', e.target.value)}
          disabled={!form.projectId || loadingMembers}
        />
      </div>

      <Input
        label="Due date"
        id="task-due"
        type="date"
        value={form.dueDate ? form.dueDate.slice(0, 10) : ''}
        onChange={(e) => set('dueDate', e.target.value)}
      />

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initialData?._id ? 'Update task' : 'Create task'}
        </button>
      </div>
    </form>
  );
}
