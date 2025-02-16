import api from "@shared/Interceptors";
import { AcordoComercialModel, ResponseNfItem } from "@shared/models/AcordoComercialModel";

export const getAllAcordosComerciaisByUser = async (data: AcordoComercialModel) => {
  try {
    const response = await api.post('/acordos/ACI/getByUserAndStatus', data);
    return response.data;
  } catch (error) {
    console.error('Error fetching all acordos comerciais:', error);
    throw error;
  }
};

export const getAcordosComerciaisByStatusAsync = async (
  usuarioInsercao: number,
  codigoStatus: number,
  page: number,
  limit: number
) => {
  try {
    const response = await api.get('/acordos/ACI/getByUserAndStatus', {
      params: {
        usuarioInsercao,
        codigoStatus,
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching acordos comerciais by status:', error);
    throw error;
  }
};

export const getItemsByNfAsync = async (nfCode: string): Promise<ResponseNfItem> => {
  try {
    const nfItems = await api.get(`garantias/item/by-nf/${nfCode}`);
    return nfItems.data;
  } catch (error) {
    console.error('Error fetching acordos comerciais by status:', error);
    throw error;
  }
}