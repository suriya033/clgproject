// src/api/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Determine base URL depending on platform
// For Android emulator use 10.0.2.2, otherwise use local IP or localhost as appropriate.
const DEV_MACHINE_IP = '10.75.151.35'; // Updated to current machine IP

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

console.log('🌐 API Configuration:', {
  platform: Platform.OS,
  baseURL: FINAL_API_URL,
  devMachineIP: DEV_MACHINE_IP
});

const api = axios.create({
  baseURL: FINAL_API_URL,
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  async (config) => {
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ API Error Response: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      console.error('❌ API Network Error: No response received from server');
      // Only alert if it's a network/connectivity issue to avoid spamming on logical 400s
      if (typeof window !== 'undefined' || Platform.OS !== 'web') {
        const { Alert } = require('react-native');
        Alert.alert(
          'Connection Error',
          'Could not connect to the server. Please check your internet connection or server status.',
          [{ text: 'Retry', onPress: () => { } }]
        );
      }
    } else {
      console.error('❌ API Error:', error.message);
    }
    return Promise.reject(error);
  }
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
