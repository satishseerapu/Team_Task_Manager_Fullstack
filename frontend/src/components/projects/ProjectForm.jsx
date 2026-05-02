import { useState } from 'react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';

export default function ProjectForm({ onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrors({ name: 'Project name is required' });
      return;
    }
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Project name *"
        id="proj-name"
        placeholder="e.g. Mobile App Redesign"
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
        error={errors.name}
      />
      <Textarea
        label="Description"
        id="proj-desc"
        placeholder="What is this project about?"
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
      />
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create project'}
        </button>
      </div>
    </form>
  );
}
