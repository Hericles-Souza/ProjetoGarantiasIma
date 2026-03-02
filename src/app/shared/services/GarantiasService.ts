import api from "@shared/Interceptors";
import { GarantiasModel, UpdateItemRequest } from "@shared/models/GarantiasModel.ts";


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

export const updateGarantiaItemByIdAsync = async (itemId: string, data: UpdateItemRequest) => {
  if (!itemId) {
    throw new Error('ID da garantia é obrigatório');
  }
  
  const teste = await api.put(`garantias/item/update/${itemId}`, data);
  
  // console.log("teste: ", teste);

  return teste;
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

export const getGarantiasByUser = (username: string) => {
  return api.get(`/garantias/by-user/${username}`);
}


export const getAllRGIItens = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Token de autenticação não encontrado');

  try {
    const response = await api.get('/garantias/item/getAll', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar itens RGI:', error);
    throw error;
  }
}

export const getAllNewItems = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Token de autenticação não encontrado');

  try {
    const response = await api.get('/nota-fiscal/get-all', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar itens novos:', error);
    throw error;
  }
}


