import api from './axios';

export const authAPI = {
  signup: async (name, email, password) => {
    const response = await api.post('/auth/signup', { name, email, password });
    return response.data;
  },

  signin: async (email, password) => {
    const response = await api.post('/auth/signin', { email, password });
    return response.data;
  },

  google: async (credential) => {
    const response = await api.post('/auth/google', { credential });
    return response.data;
  },

  getConfig: async () => {
    const response = await api.get('/auth/config');
    return response.data;
  },
};
