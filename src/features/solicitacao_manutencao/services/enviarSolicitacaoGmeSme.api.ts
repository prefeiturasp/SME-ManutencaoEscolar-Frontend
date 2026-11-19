"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { obterMensagemErro } from "@/utils/erro";
import axios from "axios";
import type {
  AnaliseDreResposta,
  EnviarSolicitacaoGmeSmeParams,
  EnviarSolicitacaoGmeSmeResultado,
} from "../types/analiseDre.types";

export async function enviarSolicitacaoGmeSmeAction({
  uuid,
  ...dados
}: EnviarSolicitacaoGmeSmeParams): Promise<EnviarSolicitacaoGmeSmeResultado> {
  try {
    const data = await requisicaoAutenticada<AnaliseDreResposta>({
      method: "PUT",
      url: `/solicitacoes-manutencao/aprovar-solicitacao-pela-dre/${encodeURIComponent(uuid)}`,
      data: dados,
    });
    return { success: true, data };
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;
    const mensagem = obterMensagemErro(error);
    return {
      success: false,
      error: "api-error",
      title: mensagem.titulo,
      message: mensagem.descricao,
      status: mensagem.status,
    };
  }
}
