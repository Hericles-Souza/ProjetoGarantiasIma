import {GarantiasStatusEnum2} from "@shared/enums/GarantiasStatusEnum.ts";

export interface GarantiaItem {
  codigoPeca: string;
  id: string;
  rgi: string;
  codigoItem: string;
  tipoDefeito: string;
  modeloVeiculoAplicado: string;
  torqueAplicado: number;
  nfReferencia: string;
  loteItemOficial: string;
  loteItem: string;
  status: string; 
  codigoStatus: GarantiasStatusEnum2;
  solicitarRessarcimento: boolean;
  anexos?: string;
}

export interface GarantiasModel {
  id?: string; 
  createdAt?: string;
  updatedAt?: string; 
  rgi?: string;
  razaoSocial?: string;
  telefone?: string;
  email?: string;
  nf?: string;
  fornecedor?: string;
  status?: string;
  codigoStatus?: GarantiasStatusEnum2;
  observacao?: string;
  data?: string; 
  usuarioInsercao?: string;
  dataAtualizacao?: string;
  usuarioAtualizacao?: string;
  itens?: GarantiaItem[];
}
