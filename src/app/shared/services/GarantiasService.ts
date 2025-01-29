import api from "@shared/Interceptors";
import {GarantiaItem, GarantiasModel} from "@shared/models/GarantiasModel.ts";
import {GarantiasDto} from "@shared/dtos/GarantiasDto.ts";


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

export const updateGarantiasHeaderByIdAsync = (id: string, data: GarantiasDto) => {
  return api.put(`garantias/garantiasHeader/${id}/UpdateHeader`, data);
}

export const updateGarantiaItemByIdAsync = (id: string, data: GarantiaItem) => {
  return api.put(`garantias/garantiasHeader/${id}/UpdateItem`, data);
}

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
