import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '@shared/contexts/Auth/AuthContext.tsx';
import { UserRoleEnum } from '@shared/enums/UserRoleEnum.ts';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRoleEnum[]; 
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const context = useContext(AuthContext);

  if (!context || !context.user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(context.user.rule.name as UserRoleEnum)) {
    return <Navigate to="/garantias" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
