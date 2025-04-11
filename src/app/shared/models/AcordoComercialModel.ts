import { AcordoComercialItemStatusEnum2, AcordoComercialStatusEnum2 } from "@shared/enums/AcordoComercialStatusEnum";

export interface AcordoComercialItem {
  id?: string;
  codigoItem: string;
  precoUnitario: number;
  quantidade: number;
  status?: string;
  codigoStatus: AcordoComercialItemStatusEnum2;
  valorTotalItem: number;
  tipoOperacao: string;
  baseICMS: number;
  valorICMS: number;
  valorIPI: number;
  ICMS: number;
  IPI: number;
  mva: number;
  sequencia?: string;
  data?: string;
  usuarioInsercao?: string;
  dataAtualizacao?: string;
  usuarioAtualizacao?: string;
}

export interface AcordoComercialModel {
  id?: string;
  cdAci?: string;
  razaoSocial: string;
  telefone: string;
  email: string;
  status: string;
  codigoStatus: AcordoComercialStatusEnum2;
  observacao: string;
  data?: string;
  usuarioInsercao: string;
  baseICMS: number;
  ICMS: number;
  valorIPI: number;
  ICMSSubstituicao: number;
  nf: string;
  itens: AcordoComercialItem[];
  createdAt?: string;
  updatedAt?: string;
  dataAtualizacao?: string;
  usuarioAtualizacao?: string;
}

export interface ResponseNfItem{
  success: boolean;
  data: NfItem[];
}

export interface NfItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  rgi: string;
  codigoItem: string;
  loteItem: string;
  tipoDefeito: string;
  modeloVeiculoAplicado: string;
  torqueAplicado: number;
  nfReferencia: string;
  loteItemOficial: string;
  status: string;
  codigoStatus: number;
  sequencia: string;
  analiseTecnica: string | null;
  conclusao: string | null;
  solicitarRessarcimento: boolean;
  garantia_id: string;
}
