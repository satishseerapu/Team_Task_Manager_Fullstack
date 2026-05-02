import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS } from '../../utils/constants';

export function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.todo;
  return (
    <span className={`badge ${colors.bg} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} mr-1.5`} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const colors = PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.medium;
  return (
    <span className={`badge ${colors.bg} ${colors.text} capitalize`}>
      {priority}
    </span>
  );
}

export function RoleBadge({ role }) {
  const isAdmin = role === 'Admin' || role?.toLowerCase() === 'admin';
  return (
    <span className={`badge ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'} capitalize`}>
      {role}
    </span>
  );
}
