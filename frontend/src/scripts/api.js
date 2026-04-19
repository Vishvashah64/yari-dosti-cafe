import axios from 'axios';

const API = axios.create({ baseURL: process.env.BACKEND_URL });

// This automatically attaches your JWT token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;