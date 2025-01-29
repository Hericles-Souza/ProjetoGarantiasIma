export enum GarantiasStatusEnum {
  NAO_ENVIADO = 'Não enviado',
  EM_ANALISE = 'Em análise',
  PECAS_AVALIADAS_PARCIAMENTE = 'Peças avaliadas parcialmente',
  AGUARDANDO_NF_DEVOLUCAO = 'Aguardando NF de Devolução',
  AGUARDANDO_VALIDACAO_NF_DEVOLUCAO = 'Aguardando Validação de NF de Devolução',
  NF_DEVOLUCAO_RECUSADA = 'NF de Devolução Recusada',
  CONFIRMADO = 'Confirmado'
}

export enum GarantiasStatusEnum2 {
  NAO_ENVIADO = 1,
  EM_ANALISE = 2,
  PECAS_AVALIADAS_PARCIAMENTE = 3,
  AGUARDANDO_NF_DEVOLUCAO = 4,
  AGUARDANDO_VALIDACAO_NF_DEVOLUCAO = 5,
  NF_DEVOLUCAO_RECUSADA = 6,
  CONFIRMADO = 7,
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
  };

  return mapping[status] || undefined;
}
