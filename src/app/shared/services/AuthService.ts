import { AuthModel } from "@shared/models/AuthModel.ts";
import { mapMeResponseToAuthModel } from "@shared/mappers/mapAuthResponseDtoToAuthModel.ts";
import { AuthResponseDto } from "@shared/dtos/AuthResponseDto.ts";
import api from "@shared/Interceptors";
import environment from "@env/environment.ts";

export const AuthService = {
  /**
   * Faz login e já carrega o perfil completo (/auth/me).
   * Antes o objeto do /auth/login ({ user, token }) ia direto para o contexto,
   * sem "rule" na raiz: a tela travava no carregamento ou quebrava no PrivateRoute
   * até o usuário recarregar a página.
   */
  login: async (username: string, password: string): Promise<AuthModel> => {
    const response = await api.post("/auth/login", { username, password });
    const token: string = response.data.token;
    localStorage.setItem(environment.TOKEN, token);
    return AuthService.getUserFromToken(token);
  },

  getUserFromToken: async (token: string): Promise<AuthModel> => {
    const response = await api.get<AuthResponseDto>("/auth/me");
    return mapMeResponseToAuthModel(response.data, token);
  },

  logout: (): void => {
    localStorage.removeItem(environment.TOKEN);
  },
};
