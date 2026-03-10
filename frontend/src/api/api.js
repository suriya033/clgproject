// src/api/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// --- CONFIGURATION ---
// 1. For Local Development (same Wi-Fi): Use your machine's IP
const DEV_MACHINE_IP = '10.219.254.154';

// 2. For APK Distribution (everyone can access): Use a Public URL
//    Examples: 'https://my-app.onrender.com' or 'https://random-id.ngrok-free.app'
const PRODUCTION_URL = 'https://yellow-cups-swim.loca.lt'; // 👈 PUT YOUR PUBLIC URL HERE

// Determine base URL depending on platform and environment
export const API_URL = (() => {
  // Always use Production URL if it's set
  if (PRODUCTION_URL) return `${PRODUCTION_URL}/api`;

  return Platform.select({
    web: 'http://localhost:5002/api',
    android: `http://${DEV_MACHINE_IP}:5002/api`,
    ios: `http://${DEV_MACHINE_IP}:5002/api`,
  });
})();


console.log('🌐 API Configuration:', {
  platform: Platform.OS,
  baseURL: API_URL,
  devMachineIP: DEV_MACHINE_IP
});

const api = axios.create({
  baseURL: API_URL,
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

      // Auto logout on 401 Unauthorized
      if (error.response.status === 401) {
        if (Platform.OS !== 'web') {
          const { DeviceEventEmitter } = require('react-native');
          DeviceEventEmitter.emit('LOGOUT');
        } else if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('LOGOUT'));
        }
      }
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

export const auth = {
  changePassword: (data) => api.put('/auth/change-password', data),
};

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
  getQuestionPapers: () => api.get('/question-papers'),
  uploadQuestionPaper: (formData) => api.post('/question-papers', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default api;
