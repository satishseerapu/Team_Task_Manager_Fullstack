import Avatar from '../ui/Avatar';
import { RoleBadge } from '../ui/Badge';
import RoleDropdown from './RoleDropdown';
import { formatDate } from '../../utils/helpers';

export default function UserTable({ users, currentUserId, onRoleChange, onRemove, actionLoading }) {
  if (!users.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <p className="text-sm">No members found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Member</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Role</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Joined</th>
            <th className="py-3 px-4" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const userId = user._id ?? user.id;
            const isSelf = userId === currentUserId;
            return (
              <tr key={userId} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} size="sm" />
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {isSelf ? (
                    <RoleBadge role={user.role} />
                  ) : (
                    <RoleDropdown
                      value={user.role}
                      onChange={(newRole) => onRoleChange(userId, newRole)}
                      disabled={actionLoading}
                    />
                  )}
                </td>
                <td className="py-3 px-4 text-gray-500">{formatDate(user.createdAt)}</td>
                <td className="py-3 px-4 text-right">
                  {!isSelf && (
                    <button
                      onClick={() => onRemove(userId, user.name)}
                      disabled={actionLoading}
                      className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
