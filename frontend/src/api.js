import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

export const sendCode = async (mode, code, error = '') => {
  const endpoint = {
    walkthrough: '/walkthrough',
    debug: '/debug',
    refactor: '/refactor',
  }[mode];

  const payload = { code };
  if (mode === 'debug') {
    payload.error = error;
  }

  try {
    const response = await axios.post(BASE_URL + endpoint, payload);
    return response.data.result;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'An error occurred');
  }
}; 