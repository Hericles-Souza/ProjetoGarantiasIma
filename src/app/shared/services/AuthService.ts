import {AuthModel} from "@shared/models/AuthModel.ts";
import {mapMeResponseToAuthModel} from "@shared/mappers/mapAuthResponseDtoToAuthModel.ts";
import {AuthResponseDto} from "@shared/dtos/AuthResponseDto.ts";
import api from "@shared/Interceptors";
import environment from "@env/environment.ts";
import {from} from "rxjs";
import {take} from "rxjs/operators";

let isLoggingIn = false;

const login = async (
  username: string,
  password: string,
  loginContext: (user: AuthModel) => void
): Promise<void> => {
  if (isLoggingIn) {
    console.log("Já está em processo de login.");
    return;
  }

  isLoggingIn = true;

  try {
    const response = await api.post("/auth/login", {
      username,
      password,
    });

    const token = response.data.token;
    localStorage.setItem(environment.TOKEN, token);

    const data: AuthModel = response.data;
    loginContext(data);
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    throw error;
  } finally {
    isLoggingIn = false;
  }
};

const getUserFromToken = (token: string, loginContext: (user: AuthModel) => void): void => {
  const response$ = from(api.get("/auth/me"));

  response$
    .pipe(take(1))
    .subscribe(
      {
        next: (response) => {
          const authResponse: AuthResponseDto = response.data;
          const user = mapMeResponseToAuthModel(authResponse, token);
          loginContext(user);
        },
        error: (error) => {
          console.error("Erro ao carregar usuário:", error);
          throw error;
        }
      }
    );
};

const logout = (logoutContext: () => void): void => {
  try {
    localStorage.removeItem(environment.TOKEN);
    logoutContext();
    console.log("Usuário deslogado com sucesso.");
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
};

export const AuthService = {
  login,
  logout,
  getUserFromToken
};
