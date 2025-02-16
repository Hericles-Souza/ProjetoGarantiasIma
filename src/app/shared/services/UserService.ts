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
  isActive: boolean;
  isAdmin: boolean;
  phone:string;
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
  phone:string;
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

export function createUser(user: CreateUserRequest, token: string) {
  return api.post('/user', JSON.stringify(user), {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }).then((value) => console.log("request: " + value.request));
}

export function updateUser(user: UpdateUserRequest, token: string) {
  return api.patch('/user/users', JSON.stringify(user), {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }).then((value) => console.log("request: " + JSON.stringify(value.request)));
}