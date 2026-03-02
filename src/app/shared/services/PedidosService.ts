import api from "@shared/Interceptors";


export const getTransportadoras = async () => {
    const response = await api.get(`/transportadoras/getAll`);
    return response.data.data;
}

