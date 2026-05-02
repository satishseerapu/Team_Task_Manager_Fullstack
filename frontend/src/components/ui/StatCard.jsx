import LoadingSpinner from './LoadingSpinner';

export default function StatCard({ label, value, icon, color = 'primary', trend }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">
          {value === undefined ? <LoadingSpinner size="sm" className="mt-2" /> : value}
        </p>
        {trend && (
          <p className={`text-xs mt-1 font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? '↑' : '↓'} {trend.label}
          </p>
        )}
      </div>
      {icon && (
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          {icon}
        </div>
      )}
    </div>
  );
}
