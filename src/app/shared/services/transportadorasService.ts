/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@shared/Interceptors';
import { Transportadora } from '@shared/models/TransportadoraModel';

export const getTransportadoras = async (): Promise<Transportadora[]> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token de autenticação ausente');

    const response = await api.get('/transportadoras', {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: '*/*',
      },
    });

    const transportadorasData = response.data;

    if (!Array.isArray(transportadorasData)) {
      console.error('response.data.data não é um array:', transportadorasData);
      return [];
    }

    return transportadorasData as Transportadora[];
  } catch (error: any) {
    console.error('Erro detalhado em getTransportadoras:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return [];
  }
};

export const getTransportadoraByName = async (razaoSocial: string): Promise<Transportadora> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token de autenticação ausente');

    const response = await api.get(`/transportadoras/by-razao-social/${razaoSocial}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: '*/*',
      },
    });

    const transportadorasData = response.data as Transportadora;

    if (!Array.isArray(transportadorasData)) {
      console.error('response.data.data não é um array:', transportadorasData);
    }

    return transportadorasData as Transportadora;
  } catch (error: any) {
    console.error('Erro detalhado em getTransportadoras:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
};

export const createTransportadora = async (
  data: Omit<Transportadora, 'id'>,
): Promise<Transportadora> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token de autenticação ausente');

    const response = await api.post('/transportadoras', data, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: '*/*',
        'Content-Type': 'application/json',
      },
    });

    const created = response.data?.data || response.data;
    return created as Transportadora;
  } catch (error: any) {
    console.error('Erro detalhado em createTransportadora:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const updateTransportadora = async (
  id: string,
  data: Partial<Omit<Transportadora, 'id'>>,
): Promise<Transportadora> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token de autenticação ausente');

    const response = await api.put(`/transportadoras/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: '*/*',
        'Content-Type': 'application/json',
      },
    });

    return response.data?.data as Transportadora;
  } catch (error: any) {
    console.error('Erro detalhado em updateTransportadora:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const deleteTransportadora = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token de autenticação ausente');

    await api.delete(`/transportadoras/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: '*/*',
      },
    });
  } catch (error: any) {
    console.error('Erro detalhado em deleteTransportadora:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const getRazoesSociais = async (): Promise<string[]> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token de autenticação ausente');

    const response = await api.get('/transportadoras/getAll', {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: '*/*',
      },
    });

    return response.data as string[];
  } catch (error: any) {
    console.error('Erro em getRazoesSociais:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return [];
  }
};
