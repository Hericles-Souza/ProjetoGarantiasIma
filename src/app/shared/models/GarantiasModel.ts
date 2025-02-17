import {GarantiasStatusEnum2} from "@shared/enums/GarantiasStatusEnum.ts";

export interface GarantiaPedidos{
  cdPedido: string;
  cdMaterial: string;
  descricaoMaterial: string;
  cdTipoOperacao: string;
  dataPedido: string;
  cdCliente: string;
  valorICMS: string;
  valorIRRF: string;
  valorISS: string;
  valorIPI: string;
  baseICMS: string;
  baseIPI: string;
  baseISS: string;
  precoUnitario: string;
  quantidade: string;
  valorTotalItem: string;
}

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
  analiseTecnica?:string;
  conclusao?:string;
  anexos?: string;
  autorizado?: string;
}

export interface UpdateItemRequest {
  garantiaId: string;
  codigoItem: string;
  tipoDefeito: string;
  modeloVeiculoAplicado: string;
  torqueAplicado: number;
  nfReferencia: string;
  loteItemOficial: string;
  loteItem: string;
  codigoStatus: number;
  solicitarRessarcimento: number;
  index: string;
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
  anexos?: string;
}
