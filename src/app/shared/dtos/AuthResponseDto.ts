import {RuleModel} from "@shared/models/RuleModel.ts";

export interface AuthResponseDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  username: string;
  fullname: string;
  shortname: string;
  email: string;
  isActive: boolean;
  isAdmin: boolean;
  codigoCigam: string;
  cnpj: string;
  rule?: RuleModel;
}
