import api from "@shared/Interceptors";


export function createUser(user: CreateUserRequest): Promise<CreateUserResponse> {
    return api.post('/user', user, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }


export function downloadFile(){}