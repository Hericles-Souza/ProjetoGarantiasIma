export interface PedidoModel {
  id?: number;
  cdPedido: string;
  cdMaterial: string;
  descricao: string;
  cdTipoOperaca: string;
  dtPedido: string;
  cdCliente: string;
  valorPICMS: number;
  valorICMS: number;
  valorICMSST: number;
  valorBCST: number;
  valorIRRF: number;
  valorISS: number;
  valorIPI: number;
  baseICMS: number;
  baseIPI: number;
  baseISS: number;
  prUnitario: number;
  quantidade: number;
  vlTotalItemL: number;
  mva: number;
  baseICMSSubstituicao: number;
  valorICMSSubstituicao: number;
  aliquotaInterna: string;
  nota_fiscal_id: string;
  notaFiscal?: {
    numeroNFOrigem?: string;
    dataNFOrigem?: string;
  };
}
export interface FormPedidoModel {
  baseICMS: string;
  valorICMS: string;
  valorICMSST: string;
  valorBCST: string;
  baseICMSSubstituicao: string;
  valorICMSSubstituicao: string;
  valorProdutos: string;
  valorIPI: string;
  valorNota: string;
  aliquotaInterna: string;
  numeroNFOrigem: string;
  dataNFOrigem: string;
}

export interface FormPedidoModel {
  baseICMS: string;
  valorICMS: string;
  valorICMSST: string;
  valorBCST: string;
  baseICMSSubstituicao: string;
  valorICMSSubstituicao: string;
  valorProdutos: string;
  valorIPI: string;
  valorNota: string;
  aliquotaInterna: string;
  numeroNFOrigem: string;
  dataNFOrigem: string;
}