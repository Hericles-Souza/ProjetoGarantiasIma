import api from "@shared/Interceptors";
import {AuthResponseDto} from "@shared/dtos/AuthResponseDto.ts";

export interface CreateUserRequest {
  username: string;
  email: string;
  fullname: string;
  shortname: string;
  password: string;
  CNPJ: string;
  codigoCigam: string;
  ruleId: string;
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

export interface GetAllUsersResponse {
  data: {
    data: {
      data: AuthResponseDto[]
    }
  };
  total: number;
  page: number;
  limit: number;
}

export function getAllUsers(page: number, limit: number): Promise<GetAllUsersResponse> {
  const body = {
    page,
    limit,
  };

  return api.post('/user/users/get-all/pagination', body);
}

export function createUser(user: CreateUserRequest): Promise<CreateUserResponse> {
  return api.post('/user', user, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}