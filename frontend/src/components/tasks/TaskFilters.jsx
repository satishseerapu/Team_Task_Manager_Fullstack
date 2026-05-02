import { useSelector } from 'react-redux';
import Select from '../ui/Select';
import { TASK_STATUS } from '../../utils/constants';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: TASK_STATUS.TODO, label: 'To Do' },
  { value: TASK_STATUS.IN_PROGRESS, label: 'In Progress' },
  { value: 'In Review', label: 'In Review' },
  { value: TASK_STATUS.DONE, label: 'Done' },
];

export default function TaskFilters({ filters, onChange }) {
  const projects = useSelector((state) => state.projects.list);

  const projectOptions = [
    { value: '', label: 'All projects' },
    ...projects.map((p) => ({ value: p._id, label: p.name })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search tasks…"
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="form-input pl-9"
        />
      </div>

      <Select
        id="filter-status"
        options={STATUS_OPTIONS}
        value={filters.status ?? ''}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="w-40"
      />

      <Select
        id="filter-project"
        options={projectOptions}
        value={filters.projectId ?? ''}
        onChange={(e) => onChange({ ...filters, projectId: e.target.value })}
        className="w-48"
      />

      {(filters.search || filters.status || filters.projectId) && (
        <button
          onClick={() => onChange({ search: '', status: '', projectId: '' })}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}
