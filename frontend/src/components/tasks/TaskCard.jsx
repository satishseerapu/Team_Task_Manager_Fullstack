import { StatusBadge, PriorityBadge } from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { formatDate, isOverdue } from '../../utils/helpers';
import { TASK_STATUS } from '../../utils/constants';

const STATUS_MAP = {
  todo: TASK_STATUS.TODO,
  in_progress: TASK_STATUS.IN_PROGRESS,
  review: 'In Review',
  done: TASK_STATUS.DONE,
};

const VALID_STATUS_OPTIONS = [
  { value: TASK_STATUS.TODO, label: 'To Do' },
  { value: TASK_STATUS.IN_PROGRESS, label: 'In Progress' },
  { value: TASK_STATUS.DONE, label: 'Done' },
];

function getStatusOptions(status) {
  const currentStatus = STATUS_MAP[status] || status;
  if (currentStatus === 'In Review') {
    return [{ value: currentStatus, label: 'In Review', disabled: true }, ...VALID_STATUS_OPTIONS];
  }
  return VALID_STATUS_OPTIONS;
}

export default function TaskCard({ task, onStatusChange, onEdit, onDelete }) {
  const overdue = isOverdue(task.dueDate) && task.status !== TASK_STATUS.DONE;
  const currentStatus = STATUS_MAP[task.status] || task.status;

  const assignee = task.assignee ?? task.assignedTo;
  const assigneeName = typeof assignee === 'object' ? assignee.name : assignee;

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{task.title}</h3>
          {task.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task._id)}
              className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <StatusBadge status={task.status} />
        {task.priority && <PriorityBadge priority={task.priority} />}
        {task.project?.name && (
          <span className="badge bg-gray-100 text-gray-600">{task.project.name}</span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        {/* Assignee */}
        <div className="flex items-center gap-1.5">
          {assigneeName ? (
            <>
              <Avatar name={assigneeName} size="sm" />
              <span className="text-xs text-gray-500">{assigneeName}</span>
            </>
          ) : (
            <span className="text-xs text-gray-400">Unassigned</span>
          )}
        </div>

        {/* Due date */}
        {task.dueDate && (
          <span className={`text-xs font-medium ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
            {overdue ? '⚠ ' : ''}{formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Quick status change */}
      {onStatusChange && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <select
            value={currentStatus}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            className="w-full text-xs form-input py-1.5"
          >
            {getStatusOptions(task.status).map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
