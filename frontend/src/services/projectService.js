import api from './api';

const projectService = {
  async getAll() {
    const { data } = await api.get('/api/projects');
    return data.data;
  },

  async getById(id) {
    const { data } = await api.get(`/api/projects/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/api/projects', payload);
    return data.data;
  },

  async delete(id) {
    const { data } = await api.delete(`/api/projects/${id}`);
    return data.data;
  },

  async addMember(projectId, userId) {
    const { data } = await api.post(`/api/projects/${projectId}/members`, { memberIds: [userId] });
    return data.data;
  },

  async removeMember(projectId, userId) {
    const { data } = await api.delete(`/api/projects/${projectId}/members`, { data: { userId } });
    return data.data;
  },
};

export default projectService;
