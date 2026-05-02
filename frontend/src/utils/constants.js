export const API_BASE_URL = 'https://teamtaskmanagerfullstack-production.up.railway.app';

export const TASK_STATUS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
};

export const STATUS_LABELS = {
  'To Do': 'To Do',
  'In Progress': 'In Progress',
  'Done': 'Done',
};

export const STATUS_COLORS = {
  'To Do':       { bg: 'bg-gray-100',  text: 'text-gray-700',  dot: 'bg-gray-400'  },
  'In Progress': { bg: 'bg-blue-100',  text: 'text-blue-700',  dot: 'bg-blue-500'  },
  'Done':        { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
};

export const PRIORITY_COLORS = {
  low: { bg: 'bg-slate-100', text: 'text-slate-600' },
  medium: { bg: 'bg-orange-100', text: 'text-orange-600' },
  high: { bg: 'bg-red-100', text: 'text-red-600' },
  critical: { bg: 'bg-rose-100', text: 'text-rose-700' },
};
