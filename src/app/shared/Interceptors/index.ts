import axios from 'axios';
import environment from "@env/environment.ts";
import {AuthService} from "@shared/services/AuthService.ts";

const api = axios.create({
  baseURL: environment.apiUrl,
  timeout: 10000,
});


api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem(environment.TOKEN);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', error);

    if (error.response && error.response.status === 401) {
      console.log('Erro 401: Deslogando usuário...');
      AuthService.logout(() => {
        window.location.href = '/login';
      });
    }

    return Promise.reject(error);
  }
);

export default api;