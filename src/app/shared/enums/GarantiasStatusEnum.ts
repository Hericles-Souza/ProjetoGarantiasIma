export enum GarantiasStatusEnum {
  NAO_ENVIADO = 'Não enviado',
  EM_ANALISE = 'Em análise',
  PECAS_AVALIADAS_PARCIAMENTE = 'Peças avaliadas parcialmente',
  AGUARDANDO_NF_DEVOLUCAO = 'Aguardando NF Devolução',
  AGUARDANDO_VALIDACAO_NF_DEVOLUCAO = 'Aguardando Validação NF Devolução',
  NF_DEVOLUCAO_RECUSADA = 'NF Devolução Recusada',
  CONFIRMADA = 'Confirmada',
  EM_ANALISE_SUPERVISOR = "Em Análise Supervisor",
  RECUSADA = "Recusada",
  ANALISE_PECAS = "Análise Peças",
  CREDITO_CONCEDIDO = "Crédito Concedido",
  PECAS_AVALIADAS = "Peças Avaliadas"
}

export enum GarantiasStatusEnum2 {
  NAO_ENVIADO = 1,
  EM_ANALISE = 2,
  PECAS_AVALIADAS_PARCIAMENTE = 3,
  AGUARDANDO_NF_DEVOLUCAO = 4,
  AGUARDANDO_VALIDACAO_NF_DEVOLUCAO = 5,
  NF_DEVOLUCAO_RECUSADA = 6,
  CONFIRMADA = 7,
  EM_ANALISE_SUPERVISOR = 8,
  RECUSADA = 9,
  ANALISE_PECAS = 10,
  CREDITO_CONCEDIDO = 11,
  PECAS_AVALIADAS = 12
}

export enum GarantiasItemStatusEnum {
  NAO_ENVIADO = "Não Enviado",
  NAO_ANALISADO = 'Não analisado',
  AUTORIZADO = 'Autorizado',
  NAO_AUTORIZADO = 'Não autorizado',
  ENVIO_AUTORIZADO = 'Envio autorizado',
  ENVIO_NAO_AUTORIZADO = 'Envio não autorizado',
  ENVIO_NF_DEV_AUTORIZADO = 'Envio NF de devolução autorizado',
  ENVIO_NF_DEV_NAO_AUTORIZADO = 'Envio NF de devolução não autorizado',
}

export enum GarantiasItemStatusEnum2 {
  NAO_ANALISADO = 1,
  AUTORIZADO = 2,
  NAO_AUTORIZADO = 3,
  ENVIO_AUTORIZADO = 4,
  ENVIO_NAO_AUTORIZADO = 5,
  ENVIO_NF_DEV_AUTORIZADO = 10,
  ENVIO_NF_DEV_NAO_AUTORIZADO = 11,
  
}

export function converterStatusGarantia(status: GarantiasStatusEnum2): GarantiasStatusEnum {
  const mapping: Record<GarantiasStatusEnum2, GarantiasStatusEnum> = {
    [GarantiasStatusEnum2.NAO_ENVIADO]: GarantiasStatusEnum.NAO_ENVIADO,
    [GarantiasStatusEnum2.EM_ANALISE]: GarantiasStatusEnum.EM_ANALISE,
    [GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE]: GarantiasStatusEnum.PECAS_AVALIADAS_PARCIAMENTE,
    [GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO]: GarantiasStatusEnum.AGUARDANDO_NF_DEVOLUCAO,
    [GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: GarantiasStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
    [GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA]: GarantiasStatusEnum.NF_DEVOLUCAO_RECUSADA,
    [GarantiasStatusEnum2.CONFIRMADA]: GarantiasStatusEnum.CONFIRMADA,
    [GarantiasStatusEnum2.EM_ANALISE_SUPERVISOR]: GarantiasStatusEnum.EM_ANALISE_SUPERVISOR,
    [GarantiasStatusEnum2.RECUSADA]: GarantiasStatusEnum.RECUSADA,
    [GarantiasStatusEnum2.ANALISE_PECAS]: GarantiasStatusEnum.ANALISE_PECAS,
    [GarantiasStatusEnum2.CREDITO_CONCEDIDO]: GarantiasStatusEnum.CREDITO_CONCEDIDO,
    [GarantiasStatusEnum2.PECAS_AVALIADAS]: GarantiasStatusEnum.PECAS_AVALIADAS,

  };

  return mapping[status];
}

export function converterStatusItemGarantia(status: GarantiasItemStatusEnum2): GarantiasItemStatusEnum {
  const mapping: Record<GarantiasItemStatusEnum2, GarantiasItemStatusEnum> = {
    [GarantiasItemStatusEnum2.NAO_ANALISADO]: GarantiasItemStatusEnum.NAO_ANALISADO,
    [GarantiasItemStatusEnum2.NAO_AUTORIZADO]: GarantiasItemStatusEnum.NAO_AUTORIZADO,
    [GarantiasItemStatusEnum2.AUTORIZADO]: GarantiasItemStatusEnum.AUTORIZADO,
    [GarantiasItemStatusEnum2.ENVIO_NAO_AUTORIZADO]: GarantiasItemStatusEnum.ENVIO_NAO_AUTORIZADO,
    [GarantiasItemStatusEnum2.ENVIO_AUTORIZADO]: GarantiasItemStatusEnum.ENVIO_AUTORIZADO,
    [GarantiasItemStatusEnum2.ENVIO_NF_DEV_NAO_AUTORIZADO]: GarantiasItemStatusEnum.ENVIO_NF_DEV_NAO_AUTORIZADO,
    [GarantiasItemStatusEnum2.ENVIO_NF_DEV_AUTORIZADO]: GarantiasItemStatusEnum.ENVIO_NF_DEV_AUTORIZADO,

  };

  return mapping[status];
}

export function converterStatusItemGarantiaInverso(status: GarantiasItemStatusEnum): GarantiasItemStatusEnum2 {
  switch (status) {
    case GarantiasItemStatusEnum.NAO_ANALISADO:
    case GarantiasItemStatusEnum.NAO_ENVIADO:
      return GarantiasItemStatusEnum2.NAO_ANALISADO;

    case GarantiasItemStatusEnum.NAO_AUTORIZADO:
      return GarantiasItemStatusEnum2.NAO_AUTORIZADO;

    case GarantiasItemStatusEnum.AUTORIZADO:
      return GarantiasItemStatusEnum2.AUTORIZADO;

    case GarantiasItemStatusEnum.ENVIO_NAO_AUTORIZADO:
    case GarantiasItemStatusEnum.ENVIO_NF_DEV_NAO_AUTORIZADO:
      return GarantiasItemStatusEnum2.ENVIO_NAO_AUTORIZADO;

    case GarantiasItemStatusEnum.ENVIO_AUTORIZADO:
    case GarantiasItemStatusEnum.ENVIO_NF_DEV_AUTORIZADO:
      return GarantiasItemStatusEnum2.ENVIO_AUTORIZADO;

    default:
      throw new Error(`Status não mapeado: ${status}`);
  }
}

export function converterStatusGarantiaTecnicoAndSupervisor(status: GarantiasStatusEnum2, garantiaItemEvaluated: boolean): GarantiasStatusEnum | string {
  const mapping: Record<GarantiasStatusEnum2, GarantiasStatusEnum | string> = {
    [GarantiasStatusEnum2.NAO_ENVIADO]: GarantiasStatusEnum.NAO_ENVIADO,
    [GarantiasStatusEnum2.EM_ANALISE]: garantiaItemEvaluated ? "Aguardando Avaliação" : "Avaliação Concluída",
    [GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE]: GarantiasStatusEnum.PECAS_AVALIADAS_PARCIAMENTE,
    [GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO]: GarantiasStatusEnum.AGUARDANDO_NF_DEVOLUCAO,
    [GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: GarantiasStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
    [GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA]: GarantiasStatusEnum.NF_DEVOLUCAO_RECUSADA,
    [GarantiasStatusEnum2.CONFIRMADA]: GarantiasStatusEnum.CONFIRMADA,
    [GarantiasStatusEnum2.EM_ANALISE_SUPERVISOR]: GarantiasStatusEnum.EM_ANALISE_SUPERVISOR,
    [GarantiasStatusEnum2.RECUSADA]: GarantiasStatusEnum.RECUSADA,
    [GarantiasStatusEnum2.ANALISE_PECAS]: GarantiasStatusEnum.ANALISE_PECAS,
    [GarantiasStatusEnum2.CREDITO_CONCEDIDO]: GarantiasStatusEnum.CREDITO_CONCEDIDO,
    [GarantiasStatusEnum2.PECAS_AVALIADAS]: GarantiasStatusEnum.PECAS_AVALIADAS,

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
    [GarantiasStatusEnum.CONFIRMADA]: GarantiasStatusEnum2.CONFIRMADA,
    [GarantiasStatusEnum.EM_ANALISE_SUPERVISOR]: GarantiasStatusEnum2.EM_ANALISE_SUPERVISOR,
    [GarantiasStatusEnum.RECUSADA]: GarantiasStatusEnum2.RECUSADA,
    [GarantiasStatusEnum.ANALISE_PECAS]: GarantiasStatusEnum2.ANALISE_PECAS,
    [GarantiasStatusEnum.CREDITO_CONCEDIDO]: GarantiasStatusEnum2.CREDITO_CONCEDIDO,
    [GarantiasStatusEnum.PECAS_AVALIADAS]: GarantiasStatusEnum2.PECAS_AVALIADAS,
  };

  return mapping[status];
}


export function converterStringParaStatusGarantia(status: string): GarantiasStatusEnum | undefined {
  const mapping: Record<string, GarantiasStatusEnum> = {
    'Não enviado': GarantiasStatusEnum.NAO_ENVIADO,
    'Em análise': GarantiasStatusEnum.EM_ANALISE,
    'Peças avaliadas parcialmente': GarantiasStatusEnum.PECAS_AVALIADAS_PARCIAMENTE,
    'Aguardando NF Devolução': GarantiasStatusEnum.AGUARDANDO_NF_DEVOLUCAO,
    'Aguardando Validação NF Devolução': GarantiasStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
    'NF Devolução Recusada': GarantiasStatusEnum.NF_DEVOLUCAO_RECUSADA,
    'Confirmada': GarantiasStatusEnum.CONFIRMADA,
    'Em Análise Supervisor': GarantiasStatusEnum.EM_ANALISE_SUPERVISOR,
    'Recusada': GarantiasStatusEnum.RECUSADA,
    'Análise Peças': GarantiasStatusEnum.ANALISE_PECAS,
    'Crédito Concedido': GarantiasStatusEnum.CREDITO_CONCEDIDO,
    'Peças Avaliadas': GarantiasStatusEnum.PECAS_AVALIADAS,
  };

  return mapping[status] || undefined;
}

export const StatusColors = {
  [GarantiasStatusEnum2.NAO_ENVIADO]: "#8C8C8C",
  [GarantiasStatusEnum2.EM_ANALISE]: "#1890FF",
  [GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE]: "#FA8C16",
  [GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO]: "#FAAD14",
  [GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: "#0CE9BD",
  [GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA]: "#FF4D4F",
  [GarantiasStatusEnum2.CONFIRMADA]: "#52C41A",
  [GarantiasStatusEnum2.EM_ANALISE_SUPERVISOR]: "#1890FF",
  [GarantiasStatusEnum2.RECUSADA]: "#FF4D4F",
  [GarantiasStatusEnum2.ANALISE_PECAS]: "#1890FF",
  [GarantiasStatusEnum2.CREDITO_CONCEDIDO]: "#52C41A",
  [GarantiasStatusEnum2.PECAS_AVALIADAS]: "#FA8C16",

} as const;

export const statusStylesRGI = {
  [GarantiasStatusEnum2.NAO_ENVIADO]: {
    backgroundColor: '#5F5A56',
    color: '#5F5A56',
  },
  [GarantiasStatusEnum2.EM_ANALISE]: {
    backgroundColor: '#1890FF',
    color: '#1890FF',
  },
  [GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE]: {
    backgroundColor: '#FA8C16',
    color: '#FA8C16',
  },
  [GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO]: {
    backgroundColor: '#FAAD14',
    color: '#FAAD14',
  },
  [GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: {
    backgroundColor: '#0CE9BD',
    color: '#0CE9BD',
  },
  [GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA]: {
    backgroundColor: '#FF4D4F',
    color: '#FF4D4F',
  },
  [GarantiasStatusEnum2.CONFIRMADA]: {
    backgroundColor: '#52C41A',
    color: '#52C41A',
  },
  [GarantiasStatusEnum2.EM_ANALISE_SUPERVISOR]: {
    backgroundColor: '#1890FF',
    color: '#1890FF',
  },
  [GarantiasStatusEnum2.RECUSADA]: {
    backgroundColor: '#FF4D4F',
    color: '#FF4D4F',
  },
  [GarantiasStatusEnum2.ANALISE_PECAS]: {
    backgroundColor: '#1890FF',
    color: '#1890FF',
  },
  [GarantiasStatusEnum2.CREDITO_CONCEDIDO]: {
    backgroundColor: '#52C41A',
    color: '#52C41A',
  },
  [GarantiasStatusEnum2.PECAS_AVALIADAS]: {
    backgroundColor: '#FA8C16',
    color: '#FA8C16',
  },
  // Adicionar estilos para os status de itens
  [GarantiasItemStatusEnum.AUTORIZADO]: {
    backgroundColor: '#52C41A', // Cor de "Confirmada"
    color: '#52C41A',
  },
  [GarantiasItemStatusEnum.NAO_AUTORIZADO]: {
    backgroundColor: '#FF4D4F', // Cor de "Recusada" ou "NF Devolução Recusada"
    color: '#FF4D4F',
  },
  [GarantiasItemStatusEnum.NAO_ANALISADO]: {
    backgroundColor: '#1890FF', // Cor de "Em análise"
    color: '#1890FF',
  },
  [GarantiasItemStatusEnum.ENVIO_AUTORIZADO]: {
    backgroundColor: '#52C41A', // Mesma cor de "Autorizado"
    color: '#52C41A',
  },
  [GarantiasItemStatusEnum.ENVIO_NAO_AUTORIZADO]: {
    backgroundColor: '#FF4D4F', // Mesma cor de "Não autorizado"
    color: '#FF4D4F',
  },
};