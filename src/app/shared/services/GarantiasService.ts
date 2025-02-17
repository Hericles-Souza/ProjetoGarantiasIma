import api from "@shared/Interceptors";
import {GarantiasModel, UpdateItemRequest} from "@shared/models/GarantiasModel.ts";


export const createGarantiaAsync = (data: GarantiasModel) => {
  return api.post('/garantias', data);
}


export const getAllGarantiasAsync = () => {
  return api.get('/garantias');
}

export const getGarantiaByIdAsync = (id: string) => {
  return api.get(`/garantias/${id}`);
}

export const deleteGarantiaByIdAsync = (id: string) => {
  return api.delete(`/garantias/garantias/${id}`);
}

export const updateGarantiasHeaderByIdAsync = (data: GarantiasModel) => {
  return api.put(`garantias/garantiasHeader/${data.id}/UpdateHeader`, data);
}

export const updateGarantiasItemStatusAsync = (descricao: string) => {
  return api.put(`/garantias/garantia-item-status`, JSON.stringify(descricao));
}

export const updateGarantiaItemByIdAsync = (itemId: string, data: UpdateItemRequest) => {
  if (!itemId) {
    throw new Error('ID da garantia é obrigatório');
  }
  return api.put(`garantias/item/update/${itemId}`, data);
};

export const getGarantiasPaginationAsync = (page: number, limit: number, search?: string) => {

  const data = {
    page,
    limit,
    search
  }

  return api.post(`/garantias/garantias/pagination`, data);
}

export const getGarantiasByStatusAsync = (page: number, limit: number, status: number) => {
  return api.get(`/garantias/garantias/status?page=${page}&limit=${limit}&codigoStatus=${status}`);
}
