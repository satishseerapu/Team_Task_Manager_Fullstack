import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import {
  fetchOrgMembers,
  createOrgUser,
  changeUserRole,
  removeOrgUser,
  clearUsersError,
} from '../store/slices/usersSlice';
import UserTable from '../components/admin/UserTable';
import UserForm from '../components/admin/UserForm';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

export default function AdminPage() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { list: users, loading, error, actionError } = useSelector((state) => state.users);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    dispatch(fetchOrgMembers());
    return () => dispatch(clearUsersError());
  }, [dispatch]);

  async function handleCreate(formData) {
    setCreating(true);
    try {
      await dispatch(createOrgUser(formData)).unwrap();
      setShowCreateModal(false);
    } catch {
      // actionError is set in Redux state; modal stays open to show it
    } finally {
      setCreating(false);
    }
  }

  function handleRoleChange(userId, role) {
    dispatch(changeUserRole({ userId, role }));
  }

  function handleRemove(userId, userName) {
    if (!window.confirm(`Remove ${userName} from the organization? This action cannot be undone.`)) return;
    dispatch(removeOrgUser(userId));
  }

  const currentUserId = user?._id ?? user?.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Panel</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage organization members and roles.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          + Add Member
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => dispatch(fetchOrgMembers())} />}

      <div className="card">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            Organization Members
            {!loading && (
              <span className="ml-2 text-sm font-normal text-gray-500">({users.length})</span>
            )}
          </h2>
        </div>
        {loading ? (
          <div className="flex justify-center p-10">
            <LoadingSpinner />
          </div>
        ) : (
          <UserTable
            users={users}
            currentUserId={currentUserId}
            onRoleChange={handleRoleChange}
            onRemove={handleRemove}
            actionLoading={false}
          />
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); dispatch(clearUsersError()); }}
        title="Add New Member"
      >
        <UserForm
          onSubmit={handleCreate}
          onCancel={() => { setShowCreateModal(false); dispatch(clearUsersError()); }}
          error={actionError}
          loading={creating}
        />
      </Modal>
    </div>
  );
}
