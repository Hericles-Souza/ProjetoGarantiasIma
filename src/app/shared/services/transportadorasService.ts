import api from "@shared/Interceptors";
import { Transportadora } from "@shared/models/TransportadoraModel";
import { logApiError } from "./logApiError";

// O token já é enviado pelo interceptor; os headers repetidos em cada chamada foram removidos.

export const getTransportadoras = async (): Promise<Transportadora[]> => {
  try {
    const { data } = await api.get("/transportadoras");
    return Array.isArray(data) ? (data as Transportadora[]) : [];
  } catch (error) {
    logApiError("getTransportadoras", error);
    return [];
  }
};

export const getTransportadoraByName = async (
  razaoSocial?: string | null
): Promise<Transportadora | undefined> => {
  // RGI sem transportadora gerava GET /by-razao-social/ e um 400 no console.
  if (!razaoSocial) return undefined;

  try {
    const { data } = await api.get(
      `/transportadoras/by-razao-social/${encodeURIComponent(razaoSocial)}`
    );
    return data as Transportadora;
  } catch (error) {
    logApiError("getTransportadoraByName", error);
    return undefined;
  }
};

export const createTransportadora = async (
  data: Omit<Transportadora, "id">
): Promise<Transportadora> => {
  try {
    const response = await api.post("/transportadoras", data);
    return (response.data?.data ?? response.data) as Transportadora;
  } catch (error) {
    logApiError("createTransportadora", error);
    throw error;
  }
};

export const updateTransportadora = async (
  id: string,
  data: Partial<Omit<Transportadora, "id">>
): Promise<Transportadora> => {
  try {
    const response = await api.put(`/transportadoras/${id}`, data);
    return (response.data?.data ?? response.data) as Transportadora;
  } catch (error) {
    logApiError("updateTransportadora", error);
    throw error;
  }
};

export const deleteTransportadora = async (id: string): Promise<void> => {
  try {
    await api.delete(`/transportadoras/${id}`);
  } catch (error) {
    logApiError("deleteTransportadora", error);
    throw error;
  }
};

/** O backend devolve { success, data: string[] }; antes o objeto inteiro era tratado como lista. */
export const getRazoesSociais = async (): Promise<string[]> => {
  try {
    const { data } = await api.get("/transportadoras/getAll");
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    logApiError("getRazoesSociais", error);
    return [];
  }
};
