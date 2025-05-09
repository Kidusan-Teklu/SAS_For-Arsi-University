import axios from 'axios';

// API configuration
const API_URL = 'http://localhost:8000/api';

// Configure default axios settings
axios.defaults.baseURL = API_URL;

// Setup request interceptor for authentication
const setupAxiosInterceptors = (token) => {
  axios.interceptors.request.use(
    config => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
};

// Setup response interceptor for error handling
axios.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 errors (unauthorized) or other API errors
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized request, consider redirecting to login');
      // Could implement automatic logout or redirection here
    }
    
    // Log API errors to console
    console.error('API Error:', error);
    
    return Promise.reject(error);
  }
);

// API request methods
const api = {
  // Authentication
  login: (email, password) => axios.post('/login/', { email, password }),
  register: (userData) => axios.post('/register/', userData),
  
  // Attendance
  getAttendanceAll: () => axios.get('/attendance/all/'),
  getUserAttendance: (userId) => axios.get(`/attendance/user/${userId}/`),
  markAttendance: (data) => axios.post('/attendance/mark/', data),
  
  // User Profile
  getUserProfile: () => axios.get('/user/profile/'),
  updateUserProfile: (data) => axios.put('/user/profile/', data),
  changePassword: (data) => axios.post('/user/change-password/', data),
  
  // Face Recognition
  getFaceImages: (userId) => axios.get(`/recognition/images/${userId}/`),
  uploadFaceImage: (formData) => axios.post('/recognition/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteFaceImage: (imageId) => axios.delete(`/recognition/images/${imageId}/`),
  
  // Initialize authentication - call this when app loads with stored token
  initAuth: (token) => {
    if (token) {
      setupAxiosInterceptors(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
};

export default api; 