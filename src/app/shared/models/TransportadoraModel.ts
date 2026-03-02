export interface Transportadora {
  id: string;
  razaoSocial: string;
  cnpj: string;
  rua: string;
  numero: string;
  bairro: string;
  municipio: string;
  uf: string;
  complemento?: string;
}