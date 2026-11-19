import DynamicReport, { ReportData } from "./DynamicReport";
import { getAllItensACI } from "@shared/services/AcordoComercialService";

const loadItensACI = async (): Promise<ReportData[]> => {
  const response = await getAllItensACI();
  return Array.isArray(response) ? response : (response?.data ?? []);
};

const ItensACIReportScreen = () => (
  <DynamicReport
    load={loadItensACI}
    sheetName="Relatorio_Itens_ACI"
    fileName="relatorio_itens_aci.xlsx"
    emptyMessage="Nenhum item encontrado."
    errorMessage="Erro ao buscar itens"
  />
);

export default ItensACIReportScreen;
