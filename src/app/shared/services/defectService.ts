/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@shared/Interceptors";
import {
  Defect,
  PaginatedDefectResponse,
  TypeDefect,
} from "@shared/models/DefectModel";
import { ResponseDto } from "@shared/models/ResponseDto";

export const getDefect = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedDefectResponse> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token de autenticação ausente");

    const response = await api.get<ResponseDto<PaginatedDefectResponse>>(
      "/defeitos",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
        params: { page, limit },
      }
    );

    // console.log("Resposta completa de getDefect:", response);
    // Objeto que contém o array + paginação
    const paginatedData = response?.data?.data; // objeto com data + total + totalPages...
    const defectsData = paginatedData?.data ?? []; // array real de Defect
    // Verificar se defectsData é um array
    if (!Array.isArray(defectsData)) {
      console.error("response.data.data não é um array:", defectsData);
      return {
        data: [],
        total: 0,
        totalPages: 0,
        page,
        limit,
      };
    }

    defectsData.sort((a, b) => a.defeito.localeCompare(b.defeito));

    return {
      data: defectsData,
      total: paginatedData?.total ?? 0,
      totalPages: paginatedData?.totalPages ?? 0,
      page: paginatedData?.page ?? page,
      limit: paginatedData ?.limit ?? limit,
    };
  } catch (error: any) {
    console.error("Erro detalhado em getDefect:", {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return {
      data: [],
      total: 0,
      totalPages: 0,
      page,
      limit,
    };
  }
};

export const getTypeDefects = async (): Promise<TypeDefect[]> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token de autenticação ausente");

    const response = await api.get("/defeitos/tipo-defeito", {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    const typeDefectsData = response.data.data.data;

    // Verificar se typeDefectsData é um array
    if (!Array.isArray(typeDefectsData)) {
      console.error("response.data.data não é um array:", typeDefectsData);
      return [];
    }

    return typeDefectsData as TypeDefect[];
  } catch (error: any) {
    console.error("Erro detalhado em getTypeDefects:", {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return [];
  }
};

export const createDefect = async (defect: {
  defeito: string;
  tipoDefeito: object;
}): Promise<Defect> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token de autenticação ausente");

    const response = await api.post("/defeitos", defect, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
        "Content-Type": "application/json",
      },
    });

    // console.log('Resposta criação defeito:', response);

    let createdDefect: Defect;
    if (response.data && typeof response.data === "object") {
      createdDefect = response.data.data || response.data;
    } else {
      createdDefect = response.data as Defect;
    }

    return createdDefect;
  } catch (error: any) {
    console.error("Erro detalhado em createDefect:", {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const updateDefect = async (
  id: string,
  defect: { id: string; defeito: string; tipoDefeito: { id: string } }
): Promise<Defect> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token de autenticação ausente");

    const response = await api.put(`/defeitos/${id}`, defect, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
        "Content-Type": "application/json",
      },
    });

    // console.log('Resposta atualização defeito:', response);

    let updatedDefect: Defect;
    if (response.data && typeof response.data === "object") {
      updatedDefect = response.data.data || response.data;
    } else {
      updatedDefect = response.data as Defect;
    }

    return updatedDefect;
  } catch (error: any) {
    console.error("Erro detalhado em updateDefect:", {
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
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token de autenticação ausente");

    await api.delete(`/defeitos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    // console.log('Defeito excluído com sucesso:', id);
  } catch (error: any) {
    console.error("Erro detalhado em deleteDefect:", {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};
