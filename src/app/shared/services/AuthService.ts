import { AuthModel } from "@shared/models/AuthModel.ts";
import { mapMeResponseToAuthModel } from "@shared/mappers/mapAuthResponseDtoToAuthModel.ts";
import { AuthResponseDto } from "@shared/dtos/AuthResponseDto.ts";
import api from "@shared/Interceptors";
import environment from "@env/environment.ts";

export const AuthService = {
  login: async (username: string, password: string): Promise<AuthModel> => {
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      const token = response.data.token;
      localStorage.setItem(environment.TOKEN, token); 

      const data: AuthModel = response.data;
      return data;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    }
  },

  getUserFromToken: async (token: string): Promise<AuthModel> => {
    try {
      const response = await api.get("/auth/me");
      const authResponse: AuthResponseDto = response.data;
      const user = mapMeResponseToAuthModel(authResponse, token);
      return user;
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      throw error; 
    }
  },

  logout: (): void => {
    try {
      localStorage.removeItem(environment.TOKEN);
      // console.log("Usuário deslogado com sucesso.");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }
  },
};