import {RouteConfig} from "@shared/models/RouteConfig.ts";
import {LoginPage} from "@app/views/session/auth/login.tsx";

export const appRoutingSession: RouteConfig[] = [
  {
    path: "/login",
    element: <LoginPage/>,
    private: false
  },
]