import { RouteConfig } from "@shared/models/RouteConfig.ts";
import Garantias from "@app/views/private/garantias/screenGarantia.tsx";
import LayoutPrivate from "@shared/layouts/layout-private/index.tsx";
import InvoiceDetails from "./technicalAndSupervisorRGI/technicalAndSupervisorDetailsItens/technicalAndSupervisorDetailsItens";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum.ts";
import UserRegistration from "@app/views/private/userRegistration/UserRegistration";
import InvoicePage from "@shared/ViewPreInvoice/ViewPreInvoice";
import DetailsItensNF from "./clientProcessRGI/processItemRGI/DetailsItensNF";
import ScreenAcordoComercial from "./acordo-comercial/ScreenInitialTradeAgreement/ScreenInitialTradeAgreement";
import Dashboard from "./dashboard/dashboard";
import TechnicalAndSupervisorDetailsItens from "./technicalAndSupervisorRGI/technicalAndSupervisorDetailsItens/technicalAndSupervisorDetailsItens";
import TechnicalAndSupervisorInitialRGI from "./technicalAndSupervisorRGI/technicalAndSupervisorInitialRGI/technicalAndSupervisorInitialRGI";
import RGIDetailsInitial from "./clientProcessRGI/RGIDetailsInitial/RGIDetailsInitial";
import ScreenDetailsItensTradeAgreement from "./acordo-comercial/ScreenDetailsItensTradeAgreement/ScreenDetailsItensTradeAgreement";
import ReportScreen from "./relatorios/screenreport";
import ScreenDefect from "./defect/screenDefect";
import AcordosReportScreen from "./relatorios/AcordosReportScreen";
import ItensACIReportScreen from "./relatorios/screenItensACIReport";
import RGIReportScreen from "./relatorios/screenItensRGIReport";
import NfReportScreen from "./relatorios/screenNfReport";
import ScreenTransportadora from "./transportadoras/screenTransportadoras";

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
        allowedRoles: [
          UserRoleEnum.Supervisor,
          UserRoleEnum.Tecnico,
          UserRoleEnum.Cliente,
        ],
      },
      {
        path: "garantias/rgi/:id",
        element: <RGIDetailsInitial />,
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
        allowedRoles: [
          UserRoleEnum.Supervisor,
          UserRoleEnum.Tecnico,
          UserRoleEnum.Cliente,
        ],
      },
      //admin
      {
        path: "users",
        element: <UserRegistration />,
        private: true,
        allowedRoles: [UserRoleEnum.Admin],
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
        allowedRoles: [
          UserRoleEnum.Supervisor,
          UserRoleEnum.Tecnico,
          UserRoleEnum.Admin,
        ],
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
        allowedRoles: [UserRoleEnum.Tecnico, UserRoleEnum.Supervisor],
      },
      {
        path: "/garantias/aci/details-itens",
        element: <ScreenDetailsItensTradeAgreement />,
        private: true,
      },
      //tecnicos e supervisores e admin
      {
        path: "/relatorio/rgi",
        element: <ReportScreen />,
        private: true,
      },
      {
        path: "/relatorio/aci",
        element: <AcordosReportScreen />,
        private: true,
      },
      {
        path: "/relatorio/itens-aci-report",
        element: <ItensACIReportScreen />,
        private: true,
      },
      {
        path: "/relatorio/itens-rgi-report",
        element: <RGIReportScreen />,
        private: true,
      },
      {
        path: "/relatorio/nf-rgi-report",
        element: <NfReportScreen />,
        private: true,
      },
      {
        path: "/defect",
        element: <ScreenDefect />,
        private: true,
      },
      {
        path: "/transportadora",
        element: <ScreenTransportadora />,
        private: true,
      },
    ],
  },
];
