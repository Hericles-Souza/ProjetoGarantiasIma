import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '@shared/contexts/Auth/AuthContext.tsx';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const context = useContext(AuthContext);

  if (!context || context.user === undefined) {
    return <>{children}</>;
  }

  if (!context.user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
