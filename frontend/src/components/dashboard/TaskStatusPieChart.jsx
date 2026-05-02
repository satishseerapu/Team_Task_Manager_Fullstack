import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = {
  todo: '#6b7280',
  in_progress: '#3b82f6',
  review: '#f59e0b',
  done: '#10b981',
};

export default function TaskStatusPieChart({ statusCounts = {} }) {
  const labels = Object.keys(statusCounts).map((k) => {
    const map = { todo: 'To Do', in_progress: 'In Progress', review: 'In Review', done: 'Done' };
    return map[k] ?? k;
  });

  const data = {
    labels,
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: Object.keys(statusCounts).map((k) => COLORS[k] ?? '#9ca3af'),
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 14,
          font: { size: 12, family: 'Inter' },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.raw} tasks`,
        },
      },
    },
  };

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  if (!total) return <p className="text-sm text-gray-400 text-center py-10">No data yet</p>;

  return <Pie data={data} options={options} />;
}
