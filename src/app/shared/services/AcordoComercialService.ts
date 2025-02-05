import api from "@shared/Interceptors";
import { AcordoComercialModel } from "@shared/models/AcordoComercialModel";

const API_URL = '/acordos/ACI/getAll'; // URL da API

export const getAllAcordosComerciaisAsync = () => {
  return api.get<{ success: boolean; data: { data: AcordoComercialModel[] } }>(API_URL)
    .then(response => {
      if (response.data.success) {
        return response.data.data.data;
      } else {
        throw new Error("Nenhum acordo comercial encontrado.");
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .catch((error: any) => {
      throw new Error(error.response?.data?.message || "Erro ao buscar os acordos comerciais.");
    });
};
