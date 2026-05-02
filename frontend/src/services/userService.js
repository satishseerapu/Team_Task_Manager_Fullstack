import api from './api';

const userService = {
  async getOrgMembers() {
    const { data } = await api.get('/api/users');
    return data.data;
  },

  async updateRole(userId, role) {
    const { data } = await api.patch(`/api/users/${userId}/role`, { role });
    return data.data;
  },

  async createUser(payload) {
    const { data } = await api.post('/api/users', payload);
    return data.data;
  },

  async removeUser(userId) {
    const { data } = await api.delete(`/api/users/${userId}`);
    return data.data;
  },
};

export default userService;
