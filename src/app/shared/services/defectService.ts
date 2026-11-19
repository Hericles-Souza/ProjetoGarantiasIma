import api from "@shared/Interceptors";
import { Defect, PaginatedDefectResponse, TypeDefect } from "@shared/models/DefectModel";
import { ResponseDto } from "@shared/models/ResponseDto";
import { logApiError } from "./logApiError";

const emptyPage = (page: number, limit: number): PaginatedDefectResponse => ({
  data: [],
  total: 0,
  totalPages: 0,
  page,
  limit,
});

/** O backend às vezes devolve o objeto dentro de "data" (ResponseDto) e às vezes direto. */
const unwrap = <T>(body: unknown): T =>
  (body && typeof body === "object" && "data" in body ? (body as { data: T }).data : body) as T;

export const getDefect = async (page = 1, limit = 10): Promise<PaginatedDefectResponse> => {
  try {
    const response = await api.get<ResponseDto<PaginatedDefectResponse>>("/defeitos", {
      params: { page, limit },
    });

    const paginated = response.data?.data;
    const defects = paginated?.data;
    if (!Array.isArray(defects)) return emptyPage(page, limit);

    return {
      data: [...defects].sort((a, b) => a.defeito.localeCompare(b.defeito)),
      total: paginated.total ?? 0,
      totalPages: paginated.totalPages ?? 0,
      page: paginated.page ?? page,
      limit: paginated.limit ?? limit,
    };
  } catch (error) {
    logApiError("getDefect", error);
    return emptyPage(page, limit);
  }
};

export const getTypeDefects = async (): Promise<TypeDefect[]> => {
  try {
    const response = await api.get("/defeitos/tipo-defeito");
    const types = response.data?.data?.data;
    return Array.isArray(types) ? (types as TypeDefect[]) : [];
  } catch (error) {
    logApiError("getTypeDefects", error);
    return [];
  }
};

export const createDefect = async (defect: {
  defeito: string;
  tipoDefeito: object;
}): Promise<Defect> => {
  try {
    const response = await api.post("/defeitos", defect);
    return unwrap<Defect>(response.data);
  } catch (error) {
    logApiError("createDefect", error);
    throw error;
  }
};

export const updateDefect = async (
  id: string,
  defect: { id: string; defeito: string; tipoDefeito: { id: string } }
): Promise<Defect> => {
  try {
    const response = await api.put(`/defeitos/${id}`, defect);
    return unwrap<Defect>(response.data);
  } catch (error) {
    logApiError("updateDefect", error);
    throw error;
  }
};

export const deleteDefect = async (id: string): Promise<void> => {
  try {
    await api.delete(`/defeitos/${id}`);
  } catch (error) {
    logApiError("deleteDefect", error);
    throw error;
  }
};
