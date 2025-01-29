import {GarantiasStatusEnum2} from "@shared/enums/GarantiasStatusEnum.ts";

export interface GarantiaItem {
  id: string; // Adicionado para corresponder ao campo `id` do item
  rgi: string;
  codigoItem: string;
  tipoDefeito: string;
  modeloVeiculoAplicado: string;
  torqueAplicado: number;
  nfReferencia: string;
  loteItemOficial: string;
  loteItem: string;
  status: string; // Adicionado para corresponder ao campo `status` do item
  codigoStatus: GarantiasStatusEnum2;
}

export interface GarantiasModel {
  id: string; // Adicionado para corresponder ao campo `id` da garantia
  createdAt: string; // Adicionado para corresponder ao campo `createdAt`
  updatedAt: string; // Adicionado para corresponder ao campo `updatedAt`
  rgi: string;
  razaoSocial: string;
  telefone: string;
  email: string;
  nf: string;
  fornecedor: string;
  status: string; // Adicionado para corresponder ao campo `status`
  codigoStatus: GarantiasStatusEnum2;
  observacao: string;
  data: string; // Adicionado para corresponder ao campo `data`
  usuarioInsercao: string;
  dataAtualizacao: string;
  usuarioAtualizacao: string;
  itens: GarantiaItem[];
}
