export enum AcordoStatusEnum {
    NAO_ENVIADO = 'Não enviado',
    AGUARDANDO_NF_DEVOLUCAO = 'Aguardando NF Devolucao',
    AGUARDANDO_VALIDACAO_NF_DEVOLUCAO = 'Aguardando Validacao NF Devolucao',
    NF_DEVOLUCAO_RECUSADA = 'NF Devolucao Recusada',
    CONFIRMADA = 'Confirmada'
}

export enum AcordoComercialStatusEnum2 {
    NAO_ENVIADO = 2,
    AGUARDANDO_NF_DEVOLUCAO = 3,
    AGUARDANDO_VALIDACAO_NF_DEVOLUCAO = 4,
    NF_DEVOLUCAO_RECUSADA = 5,
    CONFIRMADA = 6
}

export function converterStatusAcordo(status: AcordoComercialStatusEnum2): AcordoStatusEnum {
    const mapping: Record<AcordoComercialStatusEnum2, AcordoStatusEnum> = {
        [AcordoComercialStatusEnum2.NAO_ENVIADO]: AcordoStatusEnum.NAO_ENVIADO,
        [AcordoComercialStatusEnum2.AGUARDANDO_NF_DEVOLUCAO]: AcordoStatusEnum.AGUARDANDO_NF_DEVOLUCAO,
        [AcordoComercialStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: AcordoStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
        [AcordoComercialStatusEnum2.NF_DEVOLUCAO_RECUSADA]: AcordoStatusEnum.NF_DEVOLUCAO_RECUSADA,
        [AcordoComercialStatusEnum2.CONFIRMADA]: AcordoStatusEnum.CONFIRMADA,
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
    };

    return mapping[status];
}

export function converterStringParaStatusAcordo(status: string): AcordoStatusEnum | undefined {
    const mapping: Record<string, AcordoStatusEnum> = {
        'Não enviado': AcordoStatusEnum.NAO_ENVIADO,
        'Aguardando NF de Devolucao': AcordoStatusEnum.AGUARDANDO_NF_DEVOLUCAO,
        'Aguardando Validação de NF de Devolucao': AcordoStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
        'NF de Devolução Recusada': AcordoStatusEnum.NF_DEVOLUCAO_RECUSADA,
        'Confirmada': AcordoStatusEnum.CONFIRMADA
    };

    return mapping[status] || undefined;
}

export enum AcordoItemStatusEnum {
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

export function converterStatusAcordoItem(status: AcordoComercialItemStatusEnum2): AcordoItemStatusEnum {
    const mapping: Record<AcordoComercialItemStatusEnum2, AcordoItemStatusEnum> = {
        [AcordoComercialItemStatusEnum2.NAO_ANALISADO]: AcordoItemStatusEnum.NAO_ANALISADO,
        [AcordoComercialItemStatusEnum2.AUTORIZADO]: AcordoItemStatusEnum.AUTORIZADO,
        [AcordoComercialItemStatusEnum2.NAO_AUTORIZADO]: AcordoItemStatusEnum.NAO_AUTORIZADO,
        [AcordoComercialItemStatusEnum2.NAO_ENVIADO]: AcordoItemStatusEnum.NAO_ENVIADO
    };

    return mapping[status];
}

export function converterStatusAcordoItemInverso(status: AcordoItemStatusEnum): AcordoComercialItemStatusEnum2 {
    const mapping: Record<AcordoItemStatusEnum, AcordoComercialItemStatusEnum2> = {
        [AcordoItemStatusEnum.NAO_ANALISADO]: AcordoComercialItemStatusEnum2.NAO_ANALISADO,
        [AcordoItemStatusEnum.AUTORIZADO]: AcordoComercialItemStatusEnum2.AUTORIZADO,
        [AcordoItemStatusEnum.NAO_AUTORIZADO]: AcordoComercialItemStatusEnum2.NAO_AUTORIZADO,
        [AcordoItemStatusEnum.NAO_ENVIADO]: AcordoComercialItemStatusEnum2.NAO_ENVIADO

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

export const statusStylesACI = {
    [AcordoComercialStatusEnum2.NAO_ENVIADO]: {
        backgroundColor: '#F9F9F9',
        color: '#5F5A56',
    },
    [AcordoComercialItemStatusEnum2.NAO_ANALISADO]: {
        backgroundColor: '#B3E5FC',
        color: '#0277BD',
    },
    // [AcordoComercialStatusEnum2.EM_ANALISE]: {
    //     backgroundColor: '#B3E5FC',
    //     color: '#0277BD',
    // },
    [AcordoComercialStatusEnum2.AGUARDANDO_NF_DEVOLUCAO]: {
        backgroundColor: '#FFE0B2',
        color: '#EF6C00',
    },
    [AcordoComercialStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: {
        backgroundColor: '#FFE0B2',
        color: '#EF6C00',
    },
    [AcordoComercialStatusEnum2.NF_DEVOLUCAO_RECUSADA]: {
        backgroundColor: '#4A32163D',
        color: '#4A3216',
    },
    [AcordoComercialStatusEnum2.CONFIRMADA]: {
        backgroundColor: '#C8E6C9',
        color: '#2E7D32',
    },
};