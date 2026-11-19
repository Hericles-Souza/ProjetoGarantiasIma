import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@shared/contexts/Auth/AuthContext.tsx";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum.ts";
import { homePathFor } from "./homePath";

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRoleEnum[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const context = useContext(AuthContext);

  if (!context?.user) {
    return <Navigate to="/login" replace />;
  }

  const role = context.user.rule?.name as UserRoleEnum | undefined;
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to={homePathFor(context.user)} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
