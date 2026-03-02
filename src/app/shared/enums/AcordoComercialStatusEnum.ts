export enum AcordoStatusEnum {
    NAO_ENVIADO = 'Não enviado',
    AGUARDANDO_NF_DEVOLUCAO = 'Aguardando NF Devolucao',
    AGUARDANDO_VALIDACAO_NF_DEVOLUCAO = 'Aguardando Validacao NF Devolucao',
    NF_DEVOLUCAO_RECUSADA = 'NF Devolucao Recusada',
    CONFIRMADA = 'Confirmada',
    ANALISE_PECAS = 'Análise Peças',
    CREDITO_CONCEDIDO = 'Crédito Concedido',
    PECAS_AVALIADAS = 'Peças Avaliadas'
}

export enum AcordoComercialStatusEnum2 {
    NAO_ENVIADO = 2,
    AGUARDANDO_NF_DEVOLUCAO = 3,
    AGUARDANDO_VALIDACAO_NF_DEVOLUCAO = 4,
    NF_DEVOLUCAO_RECUSADA = 5,
    CONFIRMADA = 6,
    ANALISE_PECAS = 13,
    CREDITO_CONCEDIDO = 14,
    PECAS_AVALIADAS = 15

}

export function converterStatusAcordo(status: AcordoComercialStatusEnum2): AcordoStatusEnum {
    const mapping: Record<AcordoComercialStatusEnum2, AcordoStatusEnum> = {
        [AcordoComercialStatusEnum2.NAO_ENVIADO]: AcordoStatusEnum.NAO_ENVIADO,
        [AcordoComercialStatusEnum2.AGUARDANDO_NF_DEVOLUCAO]: AcordoStatusEnum.AGUARDANDO_NF_DEVOLUCAO,
        [AcordoComercialStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: AcordoStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
        [AcordoComercialStatusEnum2.NF_DEVOLUCAO_RECUSADA]: AcordoStatusEnum.NF_DEVOLUCAO_RECUSADA,
        [AcordoComercialStatusEnum2.CONFIRMADA]: AcordoStatusEnum.CONFIRMADA,
        [AcordoComercialStatusEnum2.ANALISE_PECAS]: AcordoStatusEnum.ANALISE_PECAS,
        [AcordoComercialStatusEnum2.CREDITO_CONCEDIDO]: AcordoStatusEnum.CREDITO_CONCEDIDO,
        [AcordoComercialStatusEnum2.PECAS_AVALIADAS]: AcordoStatusEnum.PECAS_AVALIADAS,
    };

    return mapping[status];
}

export function converterStatusAcordoInverso(status: AcordoStatusEnum): AcordoComercialStatusEnum2 {
    const mapping: Record<AcordoStatusEnum, AcordoComercialStatusEnum2> = {
        [AcordoStatusEnum.NAO_ENVIADO]: AcordoComercialStatusEnum2.NAO_ENVIADO,
        [AcordoStatusEnum.AGUARDANDO_NF_DEVOLUCAO]: AcordoComercialStatusEnum2.AGUARDANDO_NF_DEVOLUCAO,
        [AcordoStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: AcordoComercialStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
        [AcordoStatusEnum.NF_DEVOLUCAO_RECUSADA]: AcordoComercialStatusEnum2.NF_DEVOLUCAO_RECUSADA,
        [AcordoStatusEnum.CONFIRMADA]: AcordoComercialStatusEnum2.CONFIRMADA,
        [AcordoStatusEnum.ANALISE_PECAS]: AcordoComercialStatusEnum2.ANALISE_PECAS,
        [AcordoStatusEnum.CREDITO_CONCEDIDO]: AcordoComercialStatusEnum2.CREDITO_CONCEDIDO,
        [AcordoStatusEnum.PECAS_AVALIADAS]: AcordoComercialStatusEnum2.PECAS_AVALIADAS,
    };

    return mapping[status];
}

export function converterStringParaStatusAcordo(status: string): AcordoStatusEnum | undefined {
    const mapping: Record<string, AcordoStatusEnum> = {
        'Não enviado': AcordoStatusEnum.NAO_ENVIADO,
        'Aguardando NF de Devolucao': AcordoStatusEnum.AGUARDANDO_NF_DEVOLUCAO,
        'Aguardando Validação de NF de Devolucao': AcordoStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
        'NF Devolução Recusada': AcordoStatusEnum.NF_DEVOLUCAO_RECUSADA,
        'Confirmada': AcordoStatusEnum.CONFIRMADA
    };

    return mapping[status] || undefined;
}

export enum AcordoComercialItemStatusEnum {
    NAO_ANALISADO = "Não analisado",
    AUTORIZADO = 'Autorizado',
    NAO_AUTORIZADO = 'Não autorizado',
    NAO_ENVIADO = "Não enviado"
}

export enum AcordoComercialItemStatusEnum2 {
    NAO_ANALISADO = 7,
    AUTORIZADO = 9,
    NAO_AUTORIZADO = 8,
    NAO_ENVIADO = 2
}

export function converterStatusAcordoItem(status: AcordoComercialItemStatusEnum2): AcordoComercialItemStatusEnum {
    const mapping: Record<AcordoComercialItemStatusEnum2, AcordoComercialItemStatusEnum> = {
        [AcordoComercialItemStatusEnum2.NAO_ANALISADO]: AcordoComercialItemStatusEnum.NAO_ANALISADO,
        [AcordoComercialItemStatusEnum2.AUTORIZADO]: AcordoComercialItemStatusEnum.AUTORIZADO,
        [AcordoComercialItemStatusEnum2.NAO_AUTORIZADO]: AcordoComercialItemStatusEnum.NAO_AUTORIZADO,
        [AcordoComercialItemStatusEnum2.NAO_ENVIADO]: AcordoComercialItemStatusEnum.NAO_ENVIADO
    };

    return mapping[status];
}

export function converterStatusAcordoItemInverso(status: AcordoComercialItemStatusEnum): AcordoComercialItemStatusEnum2 {
    const mapping: Record<AcordoComercialItemStatusEnum, AcordoComercialItemStatusEnum2> = {
        [AcordoComercialItemStatusEnum.NAO_ANALISADO]: AcordoComercialItemStatusEnum2.NAO_ANALISADO,
        [AcordoComercialItemStatusEnum.AUTORIZADO]: AcordoComercialItemStatusEnum2.AUTORIZADO,
        [AcordoComercialItemStatusEnum.NAO_AUTORIZADO]: AcordoComercialItemStatusEnum2.NAO_AUTORIZADO,
        [AcordoComercialItemStatusEnum.NAO_ENVIADO]: AcordoComercialItemStatusEnum2.NAO_ENVIADO

    };

    return mapping[status];
}

export function converterStringParaStatusAcordoItem(status: string): AcordoComercialItemStatusEnum | undefined {
    const mapping: Record<string, AcordoComercialItemStatusEnum> = {
        'Não analisado': AcordoComercialItemStatusEnum.NAO_ANALISADO,
        'Autorizado': AcordoComercialItemStatusEnum.AUTORIZADO,
        'Não autorizado': AcordoComercialItemStatusEnum.NAO_AUTORIZADO
    };

    return mapping[status] || undefined;
}

export const statusStylesACI = {
    [AcordoComercialStatusEnum2.NAO_ENVIADO]: {
        backgroundColor: '#5F5A56',
        color: '#5F5A56',
    },
    [AcordoComercialItemStatusEnum2.NAO_ANALISADO]: {
        backgroundColor: '#1890FF', // Mapeado para EM_ANALISE de GarantiasStatusEnum2
        color: '#1890FF',
    },
    [AcordoComercialStatusEnum2.AGUARDANDO_NF_DEVOLUCAO]: {
        backgroundColor: '#FAAD14',
        color: '#FAAD14',
    },
    [AcordoComercialStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: {
        backgroundColor: '#0CE9BD',
        color: '#0CE9BD',
    },
    [AcordoComercialStatusEnum2.NF_DEVOLUCAO_RECUSADA]: {
        backgroundColor: '#FF4D4F',
        color: '#FF4D4F',
    },
    [AcordoComercialStatusEnum2.CONFIRMADA]: {
        backgroundColor: '#52C41A',
        color: '#52C41A',
    },
    [AcordoComercialStatusEnum2.ANALISE_PECAS]: {
        backgroundColor: '#1890FF',
        color: '#1890FF',
    },
    [AcordoComercialStatusEnum2.CREDITO_CONCEDIDO]: {
        backgroundColor: '#52C41A',
        color: '#52C41A',
    },
    [AcordoComercialStatusEnum2.PECAS_AVALIADAS]: {
        backgroundColor: '#FA8C16',
        color: '#FA8C16',
    },
};