import api from './api';
import { storage } from '../utils/storage';

const authService = {
  async login(email, password) {
    const { data } = await api.post('/api/auth/login', { email, password });
    const { token, user } = data.data;
    storage.setToken(token);
    storage.setUser(user);
    return { token, user };
  },

  async signup(payload) {
    const { data } = await api.post('/api/auth/signup', payload);
    const { token, user } = data.data;
    storage.setToken(token);
    storage.setUser(user);
    return { token, user };
  },

  async getProfile() {
    const { data } = await api.get('/api/auth/me');
    return data.data ?? data;
  },

  async updateProfile(payload) {
    const { data } = await api.patch('/api/auth/me', payload);
    return data.data;
  },

  logout() {
    storage.clear();
  },
};

export default authService;
