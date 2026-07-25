import axios from 'axios';
import config from '../config';

export async function apiCall(action, payload = {}, userRole = 'HOD IT') {
  try {
    const res = await axios.post(config.apiBaseUrl, {
      action,
      userRole,
      ...payload,
    });
    return res.data;
  } catch (err) {
    console.warn('PHP API Call Notice (fallback active):', err.message);
    return null;
  }
}

export default apiCall;
