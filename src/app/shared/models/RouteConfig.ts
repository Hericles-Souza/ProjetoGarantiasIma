import React from "react";

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  private?: boolean;
  children?: RouteConfig[];
}