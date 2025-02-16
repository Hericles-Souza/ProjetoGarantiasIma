import { AcordoComercialStatusEnum2 } from "@shared/enums/AcordoComercialStatusEnum";

export interface AcordoComercialItem {
  id: string;
  codigoItem: string;
  precoUnitario: string;
  quantidade: number;
  status: string;
  codigoStatus: AcordoComercialStatusEnum2;
  valorTotalItem: string;
  tipoOperacao: string;
  baseICMS: string;
  valorICMS: string;
  valorIPI: string;
  ICMS: string;
  IPI: string;
  mva: string;
  sequencia: string;
  data: string;
  usuarioInsercao: string;
  dataAtualizacao: string;
  usuarioAtualizacao: string;
}

export interface AcordoComercialModel {
  id: string;
  cdAci: string;
  razaoSocial: string;
  telefone: string;
  email: string;
  status: string;
  codigoStatus: AcordoComercialStatusEnum2;
  observacao: string;
  data: string;
  usuarioInsercao: string;
  baseICMS: number;
  ICMS: string;
  valorIPI: string;
  ICMSSubstituicao: string;
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
