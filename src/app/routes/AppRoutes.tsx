import React, { Suspense, useContext } from "react";
import { StaticPageLoading } from "@shared/components/static_page_loading/static_page_loading.tsx";
import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "@app/routes/PrivateRoute.tsx";
import { routes } from "./routes";
import { RouteConfig } from "@shared/models/RouteConfig.ts";
import { AuthContext } from "@shared/contexts/Auth/AuthContext.tsx";
import { homePathFor } from "./homePath";

const AppRoutes = () => {
  const context = useContext(AuthContext);

  const renderRoute = (route: RouteConfig) => {
    const RouteComponent = route.private ? PrivateRoute : React.Fragment;
    return (
      <Route
        key={route.path}
        path={route.path}
        element={
          <Suspense fallback={<StaticPageLoading />}>
            {route.private ? (
              <RouteComponent allowedRoles={route.allowedRoles}>{route.element}</RouteComponent>
            ) : (
              route.element
            )}
          </Suspense>
        }
      >
        {route.children?.map(renderRoute)}
      </Route>
    );
  };

  return (
    <Routes>
      {routes.map(renderRoute)}
      <Route
        path="*"
        element={
          context?.user ? (
            <Navigate to={homePathFor(context.user)} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;
