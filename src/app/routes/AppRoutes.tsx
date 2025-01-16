import React from 'react'; // Adicione esta linha
import {Route, Routes} from "react-router-dom";
import PrivateRoute from "@app/routes/PrivateRoute.tsx";
import {routes} from "./routes";
import {RouteConfig} from "@shared/models/RouteConfig.ts";

const AppRoutes = () => {
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
    </Routes>
  );
};

export default AppRoutes;
