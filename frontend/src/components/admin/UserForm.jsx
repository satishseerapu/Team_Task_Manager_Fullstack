import { useState } from 'react';
import Input from '../ui/Input';
import RoleDropdown from './RoleDropdown';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

export default function UserForm({ onSubmit, onCancel, error, loading }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [validationError, setValidationError] = useState('');

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setValidationError('All fields are required.');
      return;
    }
    setValidationError('');
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(error || validationError) && <ErrorMessage message={error ?? validationError} />}
      <Input label="Full Name" id="user-name" value={form.name} onChange={set('name')} placeholder="Jane Smith" />
      <Input label="Email" id="user-email" type="email" value={form.email} onChange={set('email')} placeholder="jane@company.com" />
      <Input label="Password" id="user-password" type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" />
      <div>
        <label className="form-label">Role</label>
        <RoleDropdown value={form.role} onChange={(val) => setForm((p) => ({ ...p, role: val }))} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading && <LoadingSpinner size="sm" />}
          Create User
        </button>
      </div>
    </form>
  );
}
