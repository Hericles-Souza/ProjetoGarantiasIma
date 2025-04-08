export enum AcordoStatusEnum {
    EM_ANALISE = "Em análise",
    NAO_ENVIADO = 'Não enviado',
    AGUARDANDO_NF_DEVOLUCAO = 'Aguardando NF de Devolucao',
    AGUARDANDO_VALIDACAO_NF_DEVOLUCAO = 'Aguardando Validacao de NF de Devolução',
    NF_DEVOLUCAO_RECUSADA = 'NF de Devolução Recusada',
    AUTORIZADO = 'Autorizado'
}

export enum AcordoComercialStatusEnum2 {
    EM_ANALISE = 1,
    NAO_ENVIADO = 2,
    AGUARDANDO_NF_DEVOLUCAO = 3,
    AGUARDANDO_VALIDACAO_NF_DEVOLUCAO = 4,
    NF_DEVOLUCAO_RECUSADA = 5,
    AUTORIZADO = 6
}

export function converterStatusAcordo(status: AcordoComercialStatusEnum2): AcordoStatusEnum {
    const mapping: Record<AcordoComercialStatusEnum2, AcordoStatusEnum> = {
        [AcordoComercialStatusEnum2.NAO_ENVIADO]: AcordoStatusEnum.NAO_ENVIADO,
        [AcordoComercialStatusEnum2.AGUARDANDO_NF_DEVOLUCAO]: AcordoStatusEnum.AGUARDANDO_NF_DEVOLUCAO,
        [AcordoComercialStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: AcordoStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
        [AcordoComercialStatusEnum2.NF_DEVOLUCAO_RECUSADA]: AcordoStatusEnum.NF_DEVOLUCAO_RECUSADA,
        [AcordoComercialStatusEnum2.AUTORIZADO]: AcordoStatusEnum.AUTORIZADO,
        [AcordoComercialStatusEnum2.EM_ANALISE]: AcordoStatusEnum.EM_ANALISE
    };

    return mapping[status];
}

export function converterStatusAcordoInverso(status: AcordoStatusEnum): AcordoComercialStatusEnum2 {
    const mapping: Record<AcordoStatusEnum, AcordoComercialStatusEnum2> = {
        [AcordoStatusEnum.NAO_ENVIADO]: AcordoComercialStatusEnum2.NAO_ENVIADO,
        [AcordoStatusEnum.AGUARDANDO_NF_DEVOLUCAO]: AcordoComercialStatusEnum2.AGUARDANDO_NF_DEVOLUCAO,
        [AcordoStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: AcordoComercialStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
        [AcordoStatusEnum.NF_DEVOLUCAO_RECUSADA]: AcordoComercialStatusEnum2.NF_DEVOLUCAO_RECUSADA,
        [AcordoStatusEnum.AUTORIZADO]: AcordoComercialStatusEnum2.AUTORIZADO,
        [AcordoStatusEnum.EM_ANALISE]: AcordoComercialStatusEnum2.EM_ANALISE
    };

    return mapping[status];
}

export function converterStringParaStatusAcordo(status: string): AcordoStatusEnum | undefined {
    const mapping: Record<string, AcordoStatusEnum> = {
        'Não enviado': AcordoStatusEnum.NAO_ENVIADO,
        'Aguardando NF de Devolucao': AcordoStatusEnum.AGUARDANDO_NF_DEVOLUCAO,
        'Aguardando Validação de NF de Devolucao': AcordoStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
        'NF de Devolução Recusada': AcordoStatusEnum.NF_DEVOLUCAO_RECUSADA,
        'Autorizado': AcordoStatusEnum.AUTORIZADO
    };

    return mapping[status] || undefined;
}

export enum AcordoItemStatusEnum {
    NAO_ANALISADO = "Nao analisado",
    AUTORIZADO = 'Autorizado',
    NAO_AUTORIZADO = 'Não Autorizado',
}

export enum AcordoComercialItemStatusEnum2 {
    NAO_ANALISADO = 1, 
    AUTORIZADO = 2,
    NAO_AUTORIZADO = 3
}

export function converterStatusAcordoItem(status: AcordoComercialItemStatusEnum2): AcordoItemStatusEnum {
    const mapping: Record<AcordoComercialItemStatusEnum2, AcordoItemStatusEnum> = {
        [AcordoComercialItemStatusEnum2.NAO_ANALISADO]: AcordoItemStatusEnum.NAO_ANALISADO,
        [AcordoComercialItemStatusEnum2.AUTORIZADO]: AcordoItemStatusEnum.AUTORIZADO,
        [AcordoComercialItemStatusEnum2.NAO_AUTORIZADO]: AcordoItemStatusEnum.NAO_AUTORIZADO
    };

    return mapping[status];
}

export function converterStatusAcordoItemInverso(status: AcordoItemStatusEnum): AcordoComercialItemStatusEnum2 {
    const mapping: Record<AcordoItemStatusEnum, AcordoComercialItemStatusEnum2> = {
        [AcordoItemStatusEnum.NAO_ANALISADO]: AcordoComercialItemStatusEnum2.NAO_ANALISADO,
        [AcordoItemStatusEnum.AUTORIZADO]: AcordoComercialItemStatusEnum2.AUTORIZADO,
        [AcordoItemStatusEnum.NAO_AUTORIZADO]: AcordoComercialItemStatusEnum2.NAO_AUTORIZADO
    };

    return mapping[status];
}

export function converterStringParaStatusAcordoItem(status: string): AcordoItemStatusEnum | undefined {
    const mapping: Record<string, AcordoItemStatusEnum> = {
        'Não analisado': AcordoItemStatusEnum.NAO_ANALISADO,
        'Autorizado': AcordoItemStatusEnum.AUTORIZADO,
        'Não autorizado': AcordoItemStatusEnum.NAO_AUTORIZADO
    };

    return mapping[status] || undefined;
}

