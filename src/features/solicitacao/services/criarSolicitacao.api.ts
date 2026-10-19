"use server";

import axios from "axios";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { obterMensagemErro } from "@/utils/erro";
import type { CriarSolicitacaoParams, CriarSolicitacaoResultado } from "../types/solicitacao.types";

export async function criarSolicitacaoAction({
  dados,
  enviar = false,
}: CriarSolicitacaoParams): Promise<CriarSolicitacaoResultado> {
  const payload = new FormData();
  payload.append("unidade_educacional", dados.unidadeEducacional);
  payload.append("tipo_atendimento", dados.tipoAtendimento);
  payload.append("informacoes_adicionais", dados.informacoesAdicionais ?? "");

  dados.servicos.forEach((servico, indice) => {
    const prefixo = `servicos[${indice}]`;
    if (servico.servico === "outros") {
      payload.append(`${prefixo}servico_especifico`, servico.servico_especifico ?? "");
    } else {
      payload.append(`${prefixo}servico`, servico.servico);
    }
    payload.append(`${prefixo}local_reparo`, servico.local);
    payload.append(`${prefixo}descricao`, servico.descricao);
    servico.arquivos.forEach((arquivo, indiceArquivo) => {
      payload.append(`${prefixo}arquivos[${indiceArquivo}]`, arquivo, arquivo.name);
    });
  });

  try {
    const url = enviar ? "/solicitacoes-manutencao/?enviar=true" : "/solicitacoes-manutencao/";
    await requisicaoAutenticada({
      method: "POST",
      url,
      data: payload,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true };
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;
    const mensagem = obterMensagemErro(error, "Não foi possível cadastrar a solicitação.");
    return {
      success: false,
      error: "api-error",
      title: mensagem.titulo,
      message: mensagem.descricao,
      status: mensagem.status,
    };
  }
}
