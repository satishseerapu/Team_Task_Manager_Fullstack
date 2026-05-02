import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', organizationName: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
    setApiError('');
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.organizationName.trim()) errs.organizationName = 'Organization name is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await signup(payload);
      navigate('/dashboard');
    } catch (err) {
      const msg = typeof err === 'string' ? err : (err?.message ?? 'Registration failed. Please try again.');
      if (msg.toLowerCase().includes('organization')) {
        setErrors((e) => ({ ...e, organizationName: msg }));
      } else if (msg.toLowerCase().includes('email')) {
        setErrors((e) => ({ ...e, email: msg }));
      } else {
        setApiError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
      <p className="text-sm text-gray-500 mb-6">Start managing tasks with your team</p>

      {apiError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full name *" id="name" placeholder="Jane Smith" autoComplete="name"
          value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
        <Input label="Email address *" id="email" type="email" placeholder="you@company.com" autoComplete="email"
          value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
        <Input label="Organization name *" id="org" placeholder="Acme Inc."
          value={form.organizationName} onChange={(e) => set('organizationName', e.target.value)} error={errors.organizationName} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Password *" id="password" type="password" placeholder="Min 6 chars" autoComplete="new-password"
            value={form.password} onChange={(e) => set('password', e.target.value)} error={errors.password} />
          <Input label="Confirm password *" id="confirm-password" type="password" placeholder="Repeat password"
            value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} error={errors.confirmPassword} />
        </div>

        <button type="submit" className="btn-primary w-full py-2.5 mt-2" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account…
            </span>
          ) : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">Sign in</Link>
      </p>
    </>
  );
}
