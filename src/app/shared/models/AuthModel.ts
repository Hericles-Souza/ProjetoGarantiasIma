export interface AuthModel {
  id: string;
  username: string;
  fullname: string;
  email: string;
  isActive: boolean;
  isAdmin: boolean;
  rule: string;
  token: string;
}