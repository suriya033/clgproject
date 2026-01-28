// src/api/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Determine base URL depending on platform
// For Android emulator use 10.0.2.2, otherwise use local IP or localhost as appropriate.
const DEV_MACHINE_IP = '10.178.187.25'; // CHANGE THIS to your machine's local IP (e.g., 192.168.1.10)

const API_URL = Platform.select({
  web: 'http://localhost:5002/api',
  android: `http://${DEV_MACHINE_IP}:5002/api`,
  ios: `http://${DEV_MACHINE_IP}:5002/api`,
});

// Fallback for Android emulator if the above IP doesn't work
// const FINAL_API_URL = (__DEV__ && Platform.OS === 'android' && API_URL.includes(DEV_MACHINE_IP))
//   ? 'http://10.0.2.2:5001/api'
//   : API_URL;
const FINAL_API_URL = API_URL;

const api = axios.create({
  baseURL: FINAL_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const college = {
  createAnnouncement: (formData) => api.post('/college/announcements', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAnnouncements: () => api.get('/college/announcements'),
  deleteAnnouncement: (id) => api.delete(`/college/announcements/${id}`),
  getDepartments: () => api.get('/college/departments'),
  createDepartment: (data) => api.post('/college/departments', data),
  deleteDepartment: (id) => api.delete(`/college/departments/${id}`),
  getCourses: () => api.get('/college/courses'),
  createCourse: (data) => api.post('/college/courses', data),
  deleteCourse: (id) => api.delete(`/college/courses/${id}`),
};

export default api;
