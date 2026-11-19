import axios from "axios";
import environment from "@env/environment.ts";
import { AuthService } from "@shared/services/AuthService.ts";

const api = axios.create({
  baseURL: environment.apiUrl,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(environment.TOKEN);
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expirado/inválido: limpa a sessão e volta para o login.
    if (error.response?.status === 401 && !error.config?.url?.includes("/auth/login")) {
      AuthService.logout();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
