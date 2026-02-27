import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});

export const auth = {
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

export const admin = {
    getUsers: () => api.get('/admin/users'),
    getStats: () => api.get('/admin/stats'),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export const questionPapers = {
    get: () => api.get('/question-papers'),
    upload: (formData) => api.post('/question-papers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export default api;
