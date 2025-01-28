import {UserRoleEnum} from "@shared/enums/UserRoleEnum.ts";

export interface RuleModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: UserRoleEnum;
  code: string;
  description: string;
}