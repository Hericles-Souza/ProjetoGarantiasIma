import { lazy } from "react";
import { RouteConfig } from "@shared/models/RouteConfig.ts";
import LayoutPrivate from "@shared/layouts/layout-private/index.tsx";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum.ts";

// Telas carregadas sob demanda: antes tudo ia num único bundle de ~5,8 MB.
const Garantias = lazy(() => import("@app/views/private/garantias/screenGarantia"));
const UserRegistration = lazy(() => import("@app/views/private/userRegistration/UserRegistration"));
const InvoicePage = lazy(() => import("@shared/ViewPreInvoice/ViewPreInvoice"));
const DetailsItensNF = lazy(() => import("./clientProcessRGI/processItemRGI/DetailsItensNF"));
const ScreenAcordoComercial = lazy(
  () => import("./acordo-comercial/ScreenInitialTradeAgreement/ScreenInitialTradeAgreement")
);
const Dashboard = lazy(() => import("./dashboard/dashboard"));
const TechnicalAndSupervisorDetailsItens = lazy(
  () =>
    import("./technicalAndSupervisorRGI/technicalAndSupervisorDetailsItens/technicalAndSupervisorDetailsItens")
);
const TechnicalAndSupervisorInitialRGI = lazy(
  () =>
    import("./technicalAndSupervisorRGI/technicalAndSupervisorInitialRGI/technicalAndSupervisorInitialRGI")
);
const RGIDetailsInitial = lazy(
  () => import("./clientProcessRGI/RGIDetailsInitial/RGIDetailsInitial")
);
const ScreenDetailsItensTradeAgreement = lazy(
  () =>
    import("./acordo-comercial/ScreenDetailsItensTradeAgreement/ScreenDetailsItensTradeAgreement")
);
const ReportScreen = lazy(() => import("./relatorios/screenreport"));
const ScreenDefect = lazy(() => import("./defect/screenDefect"));
const AcordosReportScreen = lazy(() => import("./relatorios/AcordosReportScreen"));
const ItensACIReportScreen = lazy(() => import("./relatorios/screenItensACIReport"));
const RGIReportScreen = lazy(() => import("./relatorios/screenItensRGIReport"));
const NfReportScreen = lazy(() => import("./relatorios/screenNfReport"));
const ScreenTransportadora = lazy(() => import("./transportadoras/screenTransportadoras"));

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
        allowedRoles: [UserRoleEnum.Supervisor, UserRoleEnum.Tecnico, UserRoleEnum.Cliente],
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
        element: <TechnicalAndSupervisorDetailsItens />,
        private: true,
      },
      {
        path: "garantias/aci/:id",
        element: <ScreenAcordoComercial />,
        private: true,
        allowedRoles: [UserRoleEnum.Supervisor, UserRoleEnum.Tecnico, UserRoleEnum.Cliente],
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
        allowedRoles: [UserRoleEnum.Supervisor, UserRoleEnum.Tecnico, UserRoleEnum.Admin],
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
