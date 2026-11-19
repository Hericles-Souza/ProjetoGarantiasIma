import { UserRoleEnum } from "@shared/enums/UserRoleEnum.ts";
import { AuthModel } from "@shared/models/AuthModel.ts";

/**
 * Tela inicial de cada perfil. O administrador não tem acesso a /garantias:
 * redirecioná-lo para lá criava um loop de redirecionamento.
 */
export const homePathFor = (user?: AuthModel | null): string =>
  user?.rule?.name === UserRoleEnum.Admin ? "/users" : "/garantias";
