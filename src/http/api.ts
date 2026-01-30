import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('Erro na chamada da API:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default api;