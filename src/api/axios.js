// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://hnfcrm.free.je/api/', // Replace with your backend URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
