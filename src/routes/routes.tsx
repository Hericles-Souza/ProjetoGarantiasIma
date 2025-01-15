import {LoginPage} from "../app/views/auth/login.tsx";
import MainInitial from "../app/views/mainInitial/main_initial.tsx";
import Home from "../app/views/home/home.tsx";
import Garantias from "../app/views/garantias/screenGarantia.tsx";

export const routes = [
  {
    path: "/login",
    element: <LoginPage/>
  },
  {
    path: "/home",
    element: <MainInitial/>,
    children: [
      {
        path: "home",
        element: <Home/>
      },
      {
        path: "garantias",
        element: <Garantias/>
      }
    ]
  }
];
