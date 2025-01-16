import {RouteConfig} from "@shared/models/RouteConfig.ts";
import {appRoutingSession} from "@app/views/session/app-routing-session.tsx";
import {appRoutingPrivate} from "@app/views/private/app-routing-private.tsx";

export const routes: RouteConfig[] = [
  ...appRoutingSession,
  ...appRoutingPrivate
];
