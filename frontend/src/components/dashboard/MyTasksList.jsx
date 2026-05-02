import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { formatDate, isOverdue } from '../../utils/helpers';
import { TASK_STATUS } from '../../utils/constants';

export default function MyTasksList({ tasks = [] }) {
  if (!tasks.length) {
    return <p className="text-sm text-gray-400 text-center py-8">No tasks assigned to you</p>;
  }

  return (
    <div className="space-y-3">
      {tasks.slice(0, 6).map((task) => {
        const overdue = isOverdue(task.dueDate) && task.status !== TASK_STATUS.DONE;
        return (
          <div
            key={task._id}
            className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StatusBadge status={task.status} />
                {task.priority && <PriorityBadge priority={task.priority} />}
              </div>
            </div>
            {task.dueDate && (
              <span className={`text-xs font-medium flex-shrink-0 mt-0.5 ${overdue ? 'text-red-600' : 'text-gray-400'}`}>
                {overdue ? '⚠ ' : ''}{formatDate(task.dueDate)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
