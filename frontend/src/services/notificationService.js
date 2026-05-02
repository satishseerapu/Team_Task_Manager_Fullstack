import api from './api';

const notificationService = {
  async getAll() {
    const { data } = await api.get('/api/notifications');
    return data.data;
  },

  async markAsRead(id) {
    const { data } = await api.patch(`/api/notifications/${id}/read`);
    return data.data;
  },

  async markAllAsRead() {
    const { data } = await api.patch('/api/notifications/read-all');
    return data.data;
  },
};

export default notificationService;
