import axios from "axios";

/** Log padronizado dos erros de API (substitui o bloco repetido em cada service). */
export const logApiError = (context: string, error: unknown) => {
  if (axios.isAxiosError(error)) {
    console.error(`Erro em ${context}:`, {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return;
  }
  console.error(`Erro em ${context}:`, error);
};

/** Mensagem de erro vinda do backend, quando existir. */
export const apiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      { message?: string | string[]; error?: string } | undefined;
    const message = Array.isArray(data?.message) ? data?.message.join(", ") : data?.message;
    return message || data?.error || fallback;
  }
  return fallback;
};
