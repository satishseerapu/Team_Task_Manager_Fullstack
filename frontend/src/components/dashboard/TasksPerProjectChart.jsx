import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TasksPerProjectChart({ projectStats = [] }) {
  const data = {
    labels: projectStats.map((p) => p.name),
    datasets: [
      {
        label: 'Total tasks',
        data: projectStats.map((p) => p.total ?? p.taskCount ?? 0),
        backgroundColor: '#3b82f6',
        borderRadius: 6,
      },
      {
        label: 'Completed',
        data: projectStats.map((p) => p.done ?? p.completed ?? 0),
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { boxWidth: 12, font: { size: 12, family: 'Inter' } },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, family: 'Inter' } },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: 11, family: 'Inter' } },
        grid: { color: '#f3f4f6' },
      },
    },
  };

  if (!projectStats.length) return <p className="text-sm text-gray-400 text-center py-10">No project data yet</p>;

  return <Bar data={data} options={options} />;
}
