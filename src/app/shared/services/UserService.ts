import api from "@shared/Interceptors";
import { AuthResponseDto } from "@shared/dtos/AuthResponseDto.ts";

export interface CreateUserRequest {
  username: string;
  email: string;
  fullname: string;
  shortname: string;
  password: string;
  CNPJ: string;
  codigoCigam: string;
  ruleId: string;
  isActive: boolean;
  isAdmin: boolean;
  frete: boolean;
  phone: string;
}

export interface CreateUserResponse {
  data: {
    id: string;
    username: string;
    email: string;
    fullname: string;
    shortname: string;
  };
}

export interface UpdateUserRequest {
  id: string;
  username: string;
  email: string;
  fullname: string;
  shortname: string;
  password: string;
  CNPJ: string;
  codigoCigam: string;
  ruleId: string;
  isActive: boolean;
  isAdmin: boolean;
  frete: boolean;
  phone: string;
}

export interface GetAllUsersResponse {
  data: {
    data: {
      data: AuthResponseDto[];
    };
  };
  total: number;
  page: number;
  limit: number;
}

export function getAllUsers(page: number, limit: number): Promise<GetAllUsersResponse> {
  return api.post("/user/users/get-all/pagination", { page, limit });
}

// O token é enviado pelo interceptor; o parâmetro foi mantido para não mudar quem chama.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createUser(user: CreateUserRequest, _token?: string) {
  return api.post("/user", user);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function updateUser(user: UpdateUserRequest, _token?: string) {
  return api.patch("/user/users", user);
}
