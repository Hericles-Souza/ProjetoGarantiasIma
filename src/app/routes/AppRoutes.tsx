import React, { useContext } from 'react';
import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "@app/routes/PrivateRoute.tsx";
import { routes } from "./routes";
import { RouteConfig } from "@shared/models/RouteConfig.ts";
import { AuthContext } from "@shared/contexts/Auth/AuthContext.tsx";

const AppRoutes = () => {
  const context = useContext(AuthContext);

  const renderRoute = (route: RouteConfig) => {
    const RouteComponent = route.private ? PrivateRoute : React.Fragment;
    return (
      <Route key={route.path} path={route.path} element={<RouteComponent>{route.element}</RouteComponent>}>
        {route.children?.map(renderRoute)}
      </Route>
    );
  };

  return (
    <Routes>
      {routes.map(renderRoute)}
      <Route path="*" element={context?.user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
