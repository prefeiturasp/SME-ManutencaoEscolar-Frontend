"use server";

import axios from "axios";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { obterMensagemErro } from "@/utils/erro";
import type {
  CriarSolicitacaoManutencaoParams,
  CriarSolicitacaoManutencaoResultado,
  SolicitacaoManutencaoCriada,
} from "../types/solicitacaoManutencao.types";

export async function criarSolicitacaoManutencaoAction({
  enviar = false,
  ...dados
}: CriarSolicitacaoManutencaoParams): Promise<CriarSolicitacaoManutencaoResultado> {
  const payload = new FormData();
  payload.append("unidade_educacional", dados.unidade_educacional);
  payload.append("tipo_atendimento", dados.tipo_atendimento);
  payload.append("informacoes_adicionais", dados.informacoes_adicionais ?? "");

  dados.servicos.forEach((servico, indice) => {
    const prefixo = `servicos[${indice}]`;
    if (servico.servico === "outros") {
      payload.append(`${prefixo}servico_especifico`, servico.servico_especifico ?? "");
    } else {
      payload.append(`${prefixo}servico`, servico.servico);
    }
    payload.append(`${prefixo}local_reparo`, servico.local_reparo);
    payload.append(`${prefixo}descricao`, servico.descricao);
    servico.arquivos.forEach((arquivo, indiceArquivo) => {
      const anexo = arquivo.arquivo[0];
      payload.append(`${prefixo}arquivos[${indiceArquivo}]arquivo`, anexo, anexo.name);
    });
  });

  try {
    const url = enviar
      ? "/solicitacoes-manutencao/solicitacao-ue/?enviar=true"
      : "/solicitacoes-manutencao/solicitacao-ue";
    const response = await requisicaoAutenticada<SolicitacaoManutencaoCriada>({
      method: "POST",
      url,
      data: payload,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, codigo: response.codigo };
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
