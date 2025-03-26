import { GarantiaItem } from "./GarantiasModel";

export interface NotaFiscal{
id: string;
garantia_id: string;
createdAt: string;
updatedAt: string;
codigo: string;
tipo_nota: string;
data_emissao: string;
id_referencia: string;
data_atualizacao: string;
itens: GarantiaItem[]
}