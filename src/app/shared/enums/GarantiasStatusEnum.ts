export enum GarantiasStatusEnum {
  NAO_ENVIADO = 'Não enviado',
  EM_ANALISE = 'Em análise',
  PECAS_AVALIADAS_PARCIAMENTE = 'Peças avaliadas parcialmente',
  AGUARDANDO_NF_DEVOLUCAO = 'Aguardando NF de Devolução',
  AGUARDANDO_VALIDACAO_NF_DEVOLUCAO = 'Aguardando Validação de NF de Devolução',
  NF_DEVOLUCAO_RECUSADA = 'NF de Devolução Recusada',
  CONFIRMADO = 'Confirmado',
  EM_ANALISE_SUPERVISOR = "Em Análise Supervisor",
  RECUSADA = "Recusada"
}

export enum GarantiasStatusEnum2 {
  NAO_ENVIADO = 1,
  EM_ANALISE = 2,
  PECAS_AVALIADAS_PARCIAMENTE = 3,
  AGUARDANDO_NF_DEVOLUCAO = 4,
  AGUARDANDO_VALIDACAO_NF_DEVOLUCAO = 5,
  NF_DEVOLUCAO_RECUSADA = 6,
  CONFIRMADO = 7,
  EM_ANALISE_SUPERVISOR = 8,
  RECUSADA = 9
}

export enum GarantiasItemStatusEnum {
  NAO_ENVIADO = "Não Enviado",
  NAO_ANALISADO = 'Não analisado',
  AUTORIZADO = 'Autorizado',
  NAO_AUTORIZADO = 'Não autorizado'
}

export enum GarantiasItemStatusEnum2 {
  NAO_ANALISADO = 1,
  AUTORIZADO = 2,
  NAO_AUTORIZADO = 3
}

export function converterStatusGarantia(status: GarantiasStatusEnum2): GarantiasStatusEnum {
  const mapping: Record<GarantiasStatusEnum2, GarantiasStatusEnum> = {
    [GarantiasStatusEnum2.NAO_ENVIADO]: GarantiasStatusEnum.NAO_ENVIADO,
    [GarantiasStatusEnum2.EM_ANALISE]: GarantiasStatusEnum.EM_ANALISE,
    [GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE]: GarantiasStatusEnum.PECAS_AVALIADAS_PARCIAMENTE,
    [GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO]: GarantiasStatusEnum.AGUARDANDO_NF_DEVOLUCAO,
    [GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: GarantiasStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
    [GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA]: GarantiasStatusEnum.NF_DEVOLUCAO_RECUSADA,
    [GarantiasStatusEnum2.CONFIRMADO]: GarantiasStatusEnum.CONFIRMADO,
    [GarantiasStatusEnum2.EM_ANALISE_SUPERVISOR]: GarantiasStatusEnum.EM_ANALISE_SUPERVISOR,
    [GarantiasStatusEnum2.RECUSADA]: GarantiasStatusEnum.RECUSADA,

  };

  return mapping[status];
}

export function converterStatusItemGarantia(status: GarantiasItemStatusEnum2): GarantiasItemStatusEnum {
  const mapping: Record<GarantiasItemStatusEnum2, GarantiasItemStatusEnum> = {
    [GarantiasItemStatusEnum2.NAO_ANALISADO]: GarantiasItemStatusEnum.NAO_ANALISADO,
    [GarantiasItemStatusEnum2.NAO_AUTORIZADO]: GarantiasItemStatusEnum.NAO_AUTORIZADO,
    [GarantiasItemStatusEnum2.AUTORIZADO]: GarantiasItemStatusEnum.AUTORIZADO,

  };

  return mapping[status];
}

export function converterStatusGarantiaTecnicoAndSupervisor(status: GarantiasStatusEnum2, garantiaItemEvaluated: boolean): GarantiasStatusEnum | string {
  const mapping: Record<GarantiasStatusEnum2, GarantiasStatusEnum | string> = {
    [GarantiasStatusEnum2.NAO_ENVIADO]: GarantiasStatusEnum.NAO_ENVIADO,
    [GarantiasStatusEnum2.EM_ANALISE]: garantiaItemEvaluated ? "Aguardando Avaliação" : "Avaliação Concluída",
    [GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE]: GarantiasStatusEnum.PECAS_AVALIADAS_PARCIAMENTE,
    [GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO]: GarantiasStatusEnum.AGUARDANDO_NF_DEVOLUCAO,
    [GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: GarantiasStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
    [GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA]: GarantiasStatusEnum.NF_DEVOLUCAO_RECUSADA,
    [GarantiasStatusEnum2.CONFIRMADO]: GarantiasStatusEnum.CONFIRMADO,
    [GarantiasStatusEnum2.EM_ANALISE_SUPERVISOR]: GarantiasStatusEnum.EM_ANALISE_SUPERVISOR,
    [GarantiasStatusEnum2.RECUSADA]: GarantiasStatusEnum.RECUSADA,

  };

  return mapping[status];
}

export function converterStatusGarantiaInverso(status: GarantiasStatusEnum): GarantiasStatusEnum2 {
  const mapping: Record<GarantiasStatusEnum, GarantiasStatusEnum2> = {
    [GarantiasStatusEnum.NAO_ENVIADO]: GarantiasStatusEnum2.NAO_ENVIADO,
    [GarantiasStatusEnum.EM_ANALISE]: GarantiasStatusEnum2.EM_ANALISE,
    [GarantiasStatusEnum.PECAS_AVALIADAS_PARCIAMENTE]: GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE,
    [GarantiasStatusEnum.AGUARDANDO_NF_DEVOLUCAO]: GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO,
    [GarantiasStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
    [GarantiasStatusEnum.NF_DEVOLUCAO_RECUSADA]: GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA,
    [GarantiasStatusEnum.CONFIRMADO]: GarantiasStatusEnum2.CONFIRMADO,
    [GarantiasStatusEnum.EM_ANALISE_SUPERVISOR]: GarantiasStatusEnum2.EM_ANALISE_SUPERVISOR,
    [GarantiasStatusEnum.RECUSADA]: GarantiasStatusEnum2.RECUSADA,
  };

  return mapping[status];
}


export function converterStringParaStatusGarantia(status: string): GarantiasStatusEnum | undefined {
  const mapping: Record<string, GarantiasStatusEnum> = {
    'Não enviado': GarantiasStatusEnum.NAO_ENVIADO,
    'Em análise': GarantiasStatusEnum.EM_ANALISE,
    'Peças avaliadas parcialmente': GarantiasStatusEnum.PECAS_AVALIADAS_PARCIAMENTE,
    'Aguardando NF de Devolução': GarantiasStatusEnum.AGUARDANDO_NF_DEVOLUCAO,
    'Aguardando Validação de NF de Devolução': GarantiasStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
    'NF de Devolução Recusada': GarantiasStatusEnum.NF_DEVOLUCAO_RECUSADA,
    'Confirmado': GarantiasStatusEnum.CONFIRMADO,
    'Em Análise Supervisor': GarantiasStatusEnum.EM_ANALISE_SUPERVISOR,
    'Recusada': GarantiasStatusEnum.RECUSADA,
  };

  return mapping[status] || undefined;
}

export const StatusColors = {
  [GarantiasStatusEnum2.NAO_ENVIADO]: "#8C8C8C", 
  [GarantiasStatusEnum2.EM_ANALISE]: "#1890FF",
  [GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE]: "#FA8C16", 
  [GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO]: "#FAAD14",
  [GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: "#1890FF", 
  [GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA]: "#FF4D4F", 
  [GarantiasStatusEnum2.CONFIRMADO]: "#52C41A", 
  [GarantiasStatusEnum2.EM_ANALISE_SUPERVISOR]: "#1890FF", 
  [GarantiasStatusEnum2.RECUSADA]: "#FF4D4F", 
} as const;

export const statusStylesRGI = {
  [GarantiasStatusEnum2.NAO_ENVIADO]: {
    backgroundColor: '#F9F9F9',
    color: '#5F5A56',
  },
  [GarantiasStatusEnum2.EM_ANALISE]: {
    backgroundColor: '#B3E5FC',
    color: '#0277BD',
  },
  [GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE]: {
    backgroundColor: '#9747FF1F',
    color: '#9747FF',
  },
  [GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO]: {
    backgroundColor: '#FFE0B2',
    color: '#EF6C00',
  },
  [GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: {
    backgroundColor: '#FFE0B2',
    color: '#EF6C00',
  },
  [GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA]: {
    backgroundColor: '#4A32163D',
    color: '#4A3216',
  },
  [GarantiasStatusEnum2.CONFIRMADO]: {
    backgroundColor: '#C8E6C9',
    color: '#2E7D32',
  },
  [GarantiasStatusEnum2.EM_ANALISE_SUPERVISOR]: {
    backgroundColor: '#B3E5FC',
    color: '#0277BD',
  },
  [GarantiasStatusEnum2.RECUSADA]: {
    backgroundColor: '#FF4D4F',
    color: '#4A3216',
  },
};