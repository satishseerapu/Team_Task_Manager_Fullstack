import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateProfileThunk, clearAuthError } from '../store/slices/authSlice';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import { RoleBadge } from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const toast = useToast();

  const [nameForm, setNameForm] = useState({ name: user?.name ?? '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [nameSaving, setNameSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  async function handleNameSubmit(e) {
    e.preventDefault();
    if (!nameForm.name.trim()) return;
    setNameSaving(true);
    dispatch(clearAuthError());
    try {
      await dispatch(updateProfileThunk({ name: nameForm.name })).unwrap();
      toast.show('Name updated successfully', 'success');
    } catch (err) {
      toast.show(typeof err === 'string' ? err : 'Failed to update name', 'error');
    } finally {
      setNameSaving(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError('');
    dispatch(clearAuthError());

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      await dispatch(updateProfileThunk({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })).unwrap();
      toast.show('Password changed successfully', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.show(typeof err === 'string' ? err : 'Failed to change password', 'error');
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account information.</p>
      </div>

      {/* Identity card */}
      <div className="card p-5 flex items-center gap-4">
        <Avatar name={user?.name} size="lg" />
        <div>
          <p className="font-semibold text-gray-900 text-lg">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <div className="mt-1">
            <RoleBadge role={user?.role} />
          </div>
        </div>
      </div>

      {/* Name form */}
      <div className="card p-5 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Display Name</h2>
        <form onSubmit={handleNameSubmit} className="space-y-4">
          <Input
            label="Full Name"
            id="profile-name"
            value={nameForm.name}
            onChange={(e) => { setNameForm({ name: e.target.value }); setNameSuccess(''); }}
          />
          <button type="submit" disabled={nameSaving} className="btn-primary flex items-center gap-2">
            {nameSaving && <LoadingSpinner size="sm" />}
            Save Name
          </button>
        </form>
      </div>

      {/* Password form */}
      <div className="card p-5 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
        {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            id="current-password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
          />
          <Input
            label="New Password"
            id="new-password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
          />
          <Input
            label="Confirm New Password"
            id="confirm-password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
          />
          <button type="submit" disabled={passwordSaving} className="btn-primary flex items-center gap-2">
            {passwordSaving && <LoadingSpinner size="sm" />}
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
