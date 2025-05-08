
export interface PedidoModel {
  cdPedido: string;
  cdMaterial: string;
  descricao: string;
  cdTipoOperaca: string;
  dtPedido: Date;
  cdCliente: string;
  valorICMS: number;
  valorIRRF: number;
  valorISS: number;
  valorIPI: number;
  baseICMS: number;
  baseIPI: number;
  baseISS: number;
  prUnitario: number;
  quantidade: number;
  vlTotalItemL: number;
  mva: string;
}

export interface FormPedidoModel {
  baseICMS: string;
  valorICMS: string;
  baseICMSSubstituicao: string;
  valorICMSSubstituicao: string;
  valorProdutos: string;
  valorIPI: string;
  valorNota: string;
  aliquotaInterna: string;
  numeroNFOrigem: string;
  dataNFOrigem: string;
}