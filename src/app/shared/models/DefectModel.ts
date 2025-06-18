export interface Defect {
    id: string;
    defeito: string;
    dataAtualizacao: string;
    tipoDefeito: {
        id: number;
        tipoDefeito: string;
        dataCriacao: string;
    };
}

export interface TypeDefect {
    id: number;
    tipoDefeito: string;
    dataCriacao: string;
}

export interface DefectsResponse {
    data: Defect[];
    total: number;
}

export interface TypeDefectsResponse {
    data: TypeDefect[];
}