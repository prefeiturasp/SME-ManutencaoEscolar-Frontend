import axios from "axios";

export type ResultadoExclusao =
  | {
      success: true;
    }
  | {
      success: false;
      status: number;
      title: string;
      message: string;
    };

export function tratarErroExclusao(
  error: unknown,
  entidade: string,
): ResultadoExclusao {
  if (axios.isAxiosError(error)) {
    return {
      success: false,
      status: error.response?.status ?? 500,
      title: error.response?.data?.title ?? "Erro",
      message:
        error.response?.data?.message ??
        error.response?.data?.detail ??
        `Não conseguimos excluir ${entidade}. Por favor, tente novamente.`,
    };
  }

  return {
    success: false,
    status: 500,
    title: "Erro",
    message: `Ocorreu um erro inesperado ao excluir ${entidade}.`,
  };
}
