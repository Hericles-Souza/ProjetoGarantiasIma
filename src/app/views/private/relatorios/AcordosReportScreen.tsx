import DynamicReport, { ReportData } from "./DynamicReport";
import { getAllAcordos } from "@shared/services/AcordoComercialService";

// A tela paginava no cliente uma lista que já vinha paginada do servidor:
// só a primeira página tinha dados. Agora busca tudo de uma vez.
const ALL_ROWS = 100000;

const loadAcordos = async (): Promise<ReportData[]> => {
  const response = await getAllAcordos(1, ALL_ROWS);
  return response?.data?.data?.data ?? [];
};

const AcordosReportScreen = () => (
  <DynamicReport
    load={loadAcordos}
    sheetName="Relatorio_Acordos"
    fileName="relatorio_acordos.xlsx"
    emptyMessage="Nenhum acordo encontrado."
    errorMessage="Erro ao buscar acordos"
  />
);

export default AcordosReportScreen;
