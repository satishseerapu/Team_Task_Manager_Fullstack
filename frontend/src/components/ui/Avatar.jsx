import { getInitials } from '../../utils/helpers';

const COLORS = [
  'bg-primary-600',
  'bg-purple-600',
  'bg-pink-600',
  'bg-teal-600',
  'bg-orange-500',
  'bg-green-600',
];

function colorFor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Avatar({ name, size = 'md', className = '' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  return (
    <div
      className={`${colorFor(name)} ${sizes[size]} rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-white ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
