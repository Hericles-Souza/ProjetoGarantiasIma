import { RouteConfig } from "@shared/models/RouteConfig.ts";
import Garantias from "@app/views/private/garantias/screenGarantia.tsx";
import LayoutPrivate from "@shared/layouts/layout-private/index.tsx";
import InvoiceDetails from "./technicalAndSupervisorRGI/technicalAndSupervisorDetailsItens/technicalAndSupervisorDetailsItens";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum.ts";
import UserRegistration from "@app/views/private/userRegistration/UserRegistration";
import InvoicePage from "@shared/ViewPreInvoice/ViewPreInvoice";
import DetailsItensNF from "./clientProcessRGI/processItemRGI/DetailsItensNF";
import RgiDetailsPage from "./clientProcessRGI/RGIDetailsInitial/RGIDetailsInitial";
import ScreenAcordoComercial from "./acordo-comercial/ScreenInitialTradeAgreement/ScreenInitialTradeAgreement";
import Dashboard from "./dashboard/dashboard";
import ScreenDetailsItensTradeAgreement from "./acordo-comercial/ScreenDetailsItensTradeAgreement/ScreenDetailsItensTradeAgreement";
import TechnicalAndSupervisorDetailsItens from "./technicalAndSupervisorRGI/technicalAndSupervisorDetailsItens/technicalAndSupervisorDetailsItens";
import TechnicalAndSupervisorInitialRGI from "./technicalAndSupervisorRGI/technicalAndSupervisorInitialRGI/technicalAndSupervisorInitialRGI";

export const appRoutingPrivate: RouteConfig[] = [
  {
    path: "/",
    element: <LayoutPrivate />,
    private: true,
    children: [
      {
        path: "garantias",
        element: <Garantias />,
        private: true,
        allowedRoles: [UserRoleEnum.Supervisor, UserRoleEnum.Técnico, UserRoleEnum.Cliente]
      },
      {
        path: "garantias/rgi/:id",
        element: <RgiDetailsPage />,
        private: true,
      },
      {
        path: "/garantias/rgi/details-itens-nf/:nf",
        element: <DetailsItensNF />,
        private: true,
      },
      {
        path: "InvoiceDetails",
        element: <InvoiceDetails />,
        private: true,
      },
      {
        path: "garantias/aci/:id",
        element: <ScreenAcordoComercial />,
        private: true,
      },
      //admin
      {
        path: "users",
        element: <UserRegistration />,
        private: true,
        allowedRoles: [UserRoleEnum.Admin]
      },

      {
        path: "view-pre-invoice",
        element: <InvoicePage />,
        private: true,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
        private: true,
        allowedRoles: [UserRoleEnum.Supervisor, UserRoleEnum.Técnico, UserRoleEnum.Admin]
      }, 


      //tecnicos e supervisores
      {
        path: "technical-and-supervisor/details-itens",
        element: <TechnicalAndSupervisorDetailsItens />,
        private: true,
      },

      {
        path: "/garantias/technical-and-supervisor/:id",
        element: <TechnicalAndSupervisorInitialRGI />,
        private: true,
        allowedRoles: [UserRoleEnum.Técnico, UserRoleEnum.Supervisor]
      },


    ]
  }
]