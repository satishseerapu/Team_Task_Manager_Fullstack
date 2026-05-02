import { timeAgo } from '../../utils/helpers';

export default function NotificationItem({ notification, onMarkRead, onDelete }) {
  const { _id, message, isRead, createdAt, type } = notification;

  const typeIcon = {
    task_assigned: '📋',
    task_updated: '✏️',
    project_added: '📁',
    comment: '💬',
  };

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
        isRead ? 'border-gray-200 bg-white' : 'border-primary-200 bg-primary-50/40'
      }`}
    >
      <div className="text-xl flex-shrink-0 mt-0.5">{typeIcon[type] ?? '🔔'}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
          {message}
        </p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo(createdAt)}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {!isRead && (
          <button
            onClick={() => onMarkRead(_id)}
            title="Mark as read"
            className="p-1.5 text-primary-500 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onDelete(_id)}
          title="Delete"
          className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
