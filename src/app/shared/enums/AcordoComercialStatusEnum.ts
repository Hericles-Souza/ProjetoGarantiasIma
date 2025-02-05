export enum AcordoStatusEnum {
    NAO_ENVIADO = 'Não enviado',
    AGUARDANDO_NF_DEVOLUCAO = 'Aguardando NF de Devolução',
    AGUARDANDO_VALIDACAO_NF_DEVOLUCAO = 'Aguardando Validação de NF de Devolução',
    NF_DEVOLUCAO_RECUSADA = 'NF de Devolução Recusada',
    FINALIZADO = 'Finalizado'
}

export enum AcordoComercialStatusEnum2 {
    NAO_ENVIADO = 1,
    AGUARDANDO_NF_DEVOLUCAO = 2,
    AGUARDANDO_VALIDACAO_NF_DEVOLUCAO = 3,
    NF_DEVOLUCAO_RECUSADA = 4,
    FINALIZADO = 5
}

export function converterStatusAcordo(status: AcordoComercialStatusEnum2): AcordoStatusEnum {
    const mapping: Record<AcordoComercialStatusEnum2, AcordoStatusEnum> = {
        [AcordoComercialStatusEnum2.NAO_ENVIADO]: AcordoStatusEnum.NAO_ENVIADO,
        [AcordoComercialStatusEnum2.AGUARDANDO_NF_DEVOLUCAO]: AcordoStatusEnum.AGUARDANDO_NF_DEVOLUCAO,
        [AcordoComercialStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: AcordoStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
        [AcordoComercialStatusEnum2.NF_DEVOLUCAO_RECUSADA]: AcordoStatusEnum.NF_DEVOLUCAO_RECUSADA,
        [AcordoComercialStatusEnum2.FINALIZADO]: AcordoStatusEnum.FINALIZADO
    };

    return mapping[status];
}

export function converterStatusAcordoInverso(status: AcordoStatusEnum): AcordoComercialStatusEnum2 {
    const mapping: Record<AcordoStatusEnum, AcordoComercialStatusEnum2> = {
        [AcordoStatusEnum.NAO_ENVIADO]: AcordoComercialStatusEnum2.NAO_ENVIADO,
        [AcordoStatusEnum.AGUARDANDO_NF_DEVOLUCAO]: AcordoComercialStatusEnum2.AGUARDANDO_NF_DEVOLUCAO,
        [AcordoStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: AcordoComercialStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
        [AcordoStatusEnum.NF_DEVOLUCAO_RECUSADA]: AcordoComercialStatusEnum2.NF_DEVOLUCAO_RECUSADA,
        [AcordoStatusEnum.FINALIZADO]: AcordoComercialStatusEnum2.FINALIZADO
    };

    return mapping[status];
}

export function converterStringParaStatusAcordo(status: string): AcordoStatusEnum | undefined {
    const mapping: Record<string, AcordoStatusEnum> = {
        'Não enviado': AcordoStatusEnum.NAO_ENVIADO,
        'Aguardando NF de Devolução': AcordoStatusEnum.AGUARDANDO_NF_DEVOLUCAO,
        'Aguardando Validação de NF de Devolução': AcordoStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
        'NF de Devolução Recusada': AcordoStatusEnum.NF_DEVOLUCAO_RECUSADA,
        'Finalizado': AcordoStatusEnum.FINALIZADO
    };

    return mapping[status] || undefined;
}
