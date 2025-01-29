import {RouteConfig} from "@shared/models/RouteConfig.ts";
import Home from "@app/views/private/home/home.tsx";
import Garantias from "@app/views/private/garantias/screenGarantia.tsx";
import LayoutPrivate from "@shared/layouts/layout-private/index.tsx";
import ScreenAcordoComercial from "./acordo-comercial/ScreenAcordoComercial";
import RgiDetailsPage from "./rgi/RgiDetailsPage";
import InvoiceDetails from "./technicalAndSupervisorRGI/technicalAndSupervisorRGI";
import {UserRoleEnum} from "@shared/enums/UserRoleEnum.ts";
import UserRegistration from "@app/views/private/userRegistration";
import DetailsItensNF from "./rgi/processItemRGI/DetailsItensNF";

export const appRoutingPrivate: RouteConfig[] = [
  {
    path: "/",
    element: <LayoutPrivate/>,
    private: true,
    children: [
      {
        path: "home",
        element: <Home/>,
        private: true
      },
      {
        path: "garantias",
        element: <Garantias/>,
        private: true
      },
      {
        path: "acordo-comercial",
        element: <ScreenAcordoComercial/>,
        private: true
      },
      {
        path: "garantias/rgi/:id",
        element: <RgiDetailsPage />,
        private: true,
      },
      {
        path: "InvoiceDetails",
        element: <InvoiceDetails/>,
        private: true,
      },
      {
        path: "garantias/rgi/details-itens-nf/:id",
        element: <DetailsItensNF/>,
        private: true,
      },
      {
        path: "users",
        element: <UserRegistration/>,
        private: true,
        allowedRoles: [UserRoleEnum.Admin]
      }
    ]
  }
]