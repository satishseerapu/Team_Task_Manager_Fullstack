import api from './api';

const taskService = {
  async getByProject(projectId, params = {}) {
    const { data } = await api.get(`/api/tasks/project/${projectId}`, { params });
    return data.data;
  },

  async getById(id) {
    const { data } = await api.get(`/api/tasks/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/api/tasks', payload);
    return data.data;
  },

  async update(id, payload) {
    const { data } = await api.patch(`/api/tasks/${id}`, payload);
    return data.data;
  },

  async delete(id) {
    const { data } = await api.delete(`/api/tasks/${id}`);
    return data.data;
  },

  async updateStatus(id, status) {
    const statusMap = {
      todo: 'To Do',
      in_progress: 'In Progress',
      done: 'Done',
    };
    const normalizedStatus = statusMap[status] || status;
    const { data } = await api.patch(`/api/tasks/${id}/status`, { status: normalizedStatus });
    return data.data;
  },

  async assign(id, assignedTo) {
    const { data } = await api.patch(`/api/tasks/${id}/assign`, { assignedTo });
    return data.data;
  },

};

export default taskService;
