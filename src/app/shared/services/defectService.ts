/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@shared/Interceptors";
import { Defect, TypeDefect, } from "@shared/models/DefectModel";
export const getDefect = async (): Promise<Defect[]> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token de autenticação ausente');

    const response = await api.get('/defeitos', {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: '*/*',
      },
    });

    console.log('Resposta completa de getDefect:', response);
    const defectsData = response.data.data.data;

    // Verificar se defectsData é um array
    if (!Array.isArray(defectsData)) {
      console.error('response.data.data não é um array:', defectsData);
      return [];
    }

    return defectsData as Defect[];
  } catch (error: any) {
    console.error('Erro detalhado em getDefect:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return []; // Retornar array vazio em caso de erro
  }
};

export const getTypeDefects = async (): Promise<TypeDefect[]> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token de autenticação ausente');

    const response = await api.get('/defeitos/tipo-defeito', {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: '*/*',
      },
    });

    console.log('Resposta completa tipoDefeitos:', response);
    const typeDefectsData = response.data.data.data;

    // Verificar se typeDefectsData é um array
    if (!Array.isArray(typeDefectsData)) {
      console.error('response.data.data não é um array:', typeDefectsData);
      return [];
    }

    return typeDefectsData as TypeDefect[];
  } catch (error: any) {
    console.error('Erro detalhado em getTypeDefects:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return [];
  }
};

export const createDefect = async (defect: { defeito: string; tipoDefeitoId: string }): Promise<Defect> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token de autenticação ausente');

    const response = await api.post('/defeitos', defect, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: '*/*',
        'Content-Type': 'application/json',
      },
    });

    console.log('Resposta criação defeito:', response);

    let createdDefect: Defect;
    if (response.data && typeof response.data === 'object') {
      createdDefect = response.data.data || response.data;
    } else {
      createdDefect = response.data as Defect;
    }

    if (!createdDefect || typeof createdDefect !== 'object' || !createdDefect.id || !createdDefect.defeito) {
      console.error('Resposta inválida da API para criação de defeito:', response.data);
      throw new Error('Formato de resposta inválido da API');
    }

    return createdDefect;
  } catch (error: any) {
    console.error('Erro detalhado em createDefect:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const deleteDefect = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token de autenticação ausente');

    await api.delete(`/defeitos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: '*/*',
      },
    });

    console.log('Defeito excluído com sucesso:', id);
  } catch (error: any) {
    console.error('Erro detalhado em deleteDefect:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};