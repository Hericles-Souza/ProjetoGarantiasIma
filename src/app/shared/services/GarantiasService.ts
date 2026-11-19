import api from "@shared/Interceptors";
import { GarantiasModel, UpdateItemRequest } from "@shared/models/GarantiasModel.ts";

export const createGarantiaAsync = (data: GarantiasModel) => api.post("/garantias", data);

export const getAllGarantiasAsync = () => api.get("/garantias");

export const getGarantiaByIdAsync = (id: string) => api.get(`/garantias/${id}`);

export const deleteGarantiaByIdAsync = (id: string) => api.delete(`/garantias/garantias/${id}`);

export const updateGarantiasHeaderByIdAsync = (data: GarantiasModel) =>
  api.put(`/garantias/garantiasHeader/${data.id}/UpdateHeader`, data);

export const updateGarantiaItemByIdAsync = (itemId: string, data: UpdateItemRequest) => {
  if (!itemId) {
    return Promise.reject(new Error("ID do item da garantia é obrigatório"));
  }
  return api.put(`/garantias/item/update/${itemId}`, data);
};

export const getGarantiasPaginationAsync = (page: number, limit: number, search?: string) =>
  api.post(`/garantias/garantias/pagination`, { page, limit, search });

export const getGarantiasByStatusAsync = (page: number, limit: number, status: number) =>
  api.get(`/garantias/garantias/status`, { params: { page, limit, codigoStatus: status } });

/** O backend recebe o usuário por query string (antes era enviado no caminho e dava 404). */
export const getGarantiasByUser = (username: string) =>
  api.get(`/garantias/by-user`, { params: { username } });

export const getAllRGIItens = async () => {
  const response = await api.get("/garantias/item/getAll");
  return response.data;
};

export const getAllNewItems = async () => {
  const response = await api.get("/nota-fiscal/get-all");
  return response.data;
};
