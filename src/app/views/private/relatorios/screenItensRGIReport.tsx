import DynamicReport, { ReportData } from "./DynamicReport";
import { getAllRGIItens } from "@shared/services/GarantiasService";

const loadItensRGI = async (): Promise<ReportData[]> => {
  const response = await getAllRGIItens();
  return Array.isArray(response) ? response : (response?.data ?? []);
};

const RGIReportScreen = () => (
  <DynamicReport
    load={loadItensRGI}
    sheetName="Relatorio_RGI"
    fileName="relatorio_rgi.xlsx"
    emptyMessage="Nenhum item RGI encontrado."
    errorMessage="Erro ao buscar itens RGI"
  />
);

export default RGIReportScreen;
