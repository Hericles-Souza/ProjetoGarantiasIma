import { LoginPage } from "../modules/auth/login";
import Garantias from "../modules/garantias/screenGarantia";
import Home from "../modules/home/home";
import MainInitial from "../modules/mainInitial/main_initial";

export const routes = [
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/home",
    element: <MainInitial />,
    children: [
      {
        path: "home",
        element: <Home />
      },
      {
        path: "garantias",
        element: <Garantias />
      }
    ]
  }
];
