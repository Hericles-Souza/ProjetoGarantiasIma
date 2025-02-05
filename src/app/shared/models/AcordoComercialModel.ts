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
