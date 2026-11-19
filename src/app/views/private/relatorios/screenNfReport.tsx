import DynamicReport, { ReportData } from "./DynamicReport";
import { getAllNewItems } from "@shared/services/GarantiasService";

const loadNotas = async (): Promise<ReportData[]> => {
  const response = await getAllNewItems();
  return Array.isArray(response) ? response : (response?.data ?? []);
};

const NfReportScreen = () => (
  <DynamicReport
    load={loadNotas}
    sheetName="Relatorio_Novo"
    fileName="relatorio_novo.xlsx"
    emptyMessage="Nenhum item encontrado."
    errorMessage="Erro ao buscar itens"
  />
);

export default NfReportScreen;
