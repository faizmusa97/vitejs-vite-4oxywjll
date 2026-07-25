import axios from 'axios';
import config from '../config';

export async function apiCall(action, payload = {}, userRole = 'HOD IT') {
  const bodyData = {
    action,
    userRole,
    ...payload,
  };

  // Multi-tier endpoint list:
  // 1. Local Proxy '/api/' (Vite Dev Server or Nginx Proxy - 100% CORS-free)
  // 2. Direct API URL (config.apiBaseUrl)
  // 3. CORS Proxy Fallback (corsproxy.io)
  const targetUrl = config.apiBaseUrl || 'https://hnfcrm.free.je/api/';
  const endpoints = [
    '/api/',
    targetUrl,
    'https://corsproxy.io/?' + encodeURIComponent(targetUrl),
  ];

  for (const url of endpoints) {
    try {
      const res = await axios.post(url, bodyData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 8000,
      });

      if (res && res.data) {
        return res.data;
      }
    } catch (err) {
      // If endpoint fails due to CORS or network error, proceed silently to next fallback
    }
  }

  console.warn('API connection fallback active (CORS or server unreachable).');
  return null;
}

export default apiCall;
