export interface AuthResponseDto {
  id: string;
  username: string;
  fullname: string;
  shortname: string;
  isActive: boolean;
  isAdmin: boolean;
  email: string;
  rule: {
    id: string;
    name: string;
    code: string;
    description: string;
  };
}