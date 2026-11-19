import api from "@shared/Interceptors";
import {
  AcordoComercialModel,
  ResponseNfItem,
  UpdateItemResponse,
} from "@shared/models/AcordoComercialModel";
import { logApiError } from "./logApiError";

export const createAcordoAsync = (data: AcordoComercialModel) => api.post("/acordos/ACI", data);

export const getItemsByNfAsync = async (nfCode: string): Promise<ResponseNfItem> => {
  try {
    const nfItems = await api.get(`/garantias/item/by-nf/${nfCode}`);
    return nfItems.data;
  } catch (error) {
    logApiError("getItemsByNfAsync", error);
    throw error;
  }
};

export const getAcordosByUser = async (page: number, limit: number) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await api.post(`/acordos/ACI/getAllByUser`, { page, limit })) as any;
  } catch (error) {
    logApiError("getAcordosByUser", error);
    throw error;
  }
};

export const getAllAcordos = async (page: number, limit: number) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await api.post(`/acordos/ACI/getAll`, { page, limit })) as any;
  } catch (error) {
    logApiError("getAllAcordos", error);
    throw error;
  }
};

export const updateAciHeaderByIdAsync = (data: AcordoComercialModel, acordoId: string) =>
  api.put(`/acordos/ACI/${acordoId}/UpdateHeader`, data);

export const updateAciItemByIdAsync = (data: UpdateItemResponse, idItem: string) =>
  api.put(`/acordos/ACI/${idItem}/UpdateItem`, data);

export const getAcordoByIdAsync = (id: string) => api.get(`/acordos/${id}`);

export const getAllItensACI = async () => {
  const response = await api.get("/acordos/item/getAll");
  return response.data;
};
