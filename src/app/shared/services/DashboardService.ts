import api from "@shared/Interceptors";

export const getTop10ItemsRGI = async () => {
    try {
        const response = await api.get('/garantias/item/getTop10Items');
        return response.data.data as { codigoPeca: string, quantidade: number }[];
    } catch (error) {
        console.error('Error fetching all acordos comerciais:', error);
        throw error;
    }
};


export const getTop10ItemsACI = async () => {
    try {
        const response = await api.get('/acordos/item/getTop10Items');
        return response.data.data as { codigoPeca: string, quantidade: number }[];
    } catch (error) {
        console.error('Error fetching all acordos comerciais:', error);
        throw error;
    }
};


export const getRGIPorStatus = async () => {
    try {
        const response = await api.get('/garantias/indicators/indicators');

        return response.data as { status: string, quantidade: number, percentual: number }[];
    } catch (error) {
        console.error('Error fetching all acordos comerciais:', error);
        throw error;
    }
};


export const getACIPorStatus = async () => {
    try {
        const response = await api.get('/acordos/indicators/indicators');
        return response.data as { status: string, quantidade: number, percentual: number }[];
    } catch (error) {
        console.error('Error fetching all acordos comerciais:', error);
        throw error;
    }
};

export const getTop5DefectItems = async () => {
    try {
        const response = await api.get('/garantias/item/getTop5DefectItems');
        return response.data.data as { tipoDefeito: string, quantidade: number}[];
    } catch (error) {
        console.error('Error fetching all acordos comerciais:', error);
        throw error;
    }
};
