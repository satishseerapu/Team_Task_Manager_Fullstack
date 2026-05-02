import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import { formatDate } from '../../utils/helpers';

export default function ProjectCard({ project, onDelete, isAdmin }) {
  const { _id, name, description, members = [], createdAt, taskCount } = project;

  return (
    <div className="card p-5 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <Link
            to={`/projects/${_id}`}
            className="text-base font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate block"
          >
            {name}
          </Link>
          {description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
          )}
        </div>
        {isAdmin && (
          <button
            onClick={() => onDelete(_id)}
            className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors flex-shrink-0"
            title="Delete project"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
          </svg>
          {taskCount ?? 0} tasks
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(createdAt)}
        </span>
      </div>

      {/* Members */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex -space-x-2">
          {members.slice(0, 5).map((m, i) => (
            <div key={m._id ?? i} className="ring-2 ring-white rounded-full">
              <Avatar name={m.name} size="sm" />
            </div>
          ))}
          {members.length > 5 && (
            <div className="w-7 h-7 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">+{members.length - 5}</span>
            </div>
          )}
        </div>
        <Link
          to={`/projects/${_id}`}
          className="text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          View →
        </Link>
      </div>
    </div>
  );
}
