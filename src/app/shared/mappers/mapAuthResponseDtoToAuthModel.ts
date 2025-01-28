import {AuthResponseDto} from "@shared/dtos/AuthResponseDto.ts";
import {AuthModel} from "@shared/models/AuthModel.ts";

export const mapMeResponseToAuthModel = (meResponse: AuthResponseDto, token: string): AuthModel => {
  return {
    id: meResponse.id,
    username: meResponse.username,
    fullname: meResponse.fullname,
    email: meResponse.email,
    isActive: meResponse.isActive,
    isAdmin: meResponse.isAdmin,
    rule: meResponse?.rule,
    cnpj: meResponse.cnpj,
    codigoCigam: meResponse.codigoCigam,
    createdAt: meResponse.createdAt,
    shortname: meResponse.shortname,
    updatedAt: meResponse.updatedAt,
    token: token,
  };
};