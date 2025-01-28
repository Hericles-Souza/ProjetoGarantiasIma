import React from "react";

import {UserRoleEnum} from "@shared/enums/UserRoleEnum.ts";

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  private?: boolean;
  allowedRoles?: UserRoleEnum[];
  children?: RouteConfig[];
}
