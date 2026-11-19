import DynamicReport, { ReportData } from "./DynamicReport";
import { getAllGarantiasAsync } from "@shared/services/GarantiasService";

const loadGarantias = async (): Promise<ReportData[]> => {
  const response = await getAllGarantiasAsync();
  return Array.isArray(response?.data?.data) ? response.data.data : [];
};

const ReportScreen = () => (
  <DynamicReport
    load={loadGarantias}
    sheetName="Relatorio"
    fileName="relatorio.xlsx"
    emptyMessage="Nenhuma garantia encontrada."
    errorMessage="Erro ao carregar as garantias"
  />
);

export default ReportScreen;
