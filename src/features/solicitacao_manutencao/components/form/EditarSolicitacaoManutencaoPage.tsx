"use client";

import { FormError } from "@/components/form/FormError";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { Button } from "@/components/ui/button";
import { useEditarSolicitacaoManutencao } from "@/features/solicitacao_manutencao/hooks/useEditarSolicitacaoManutencao";
import { solicitacaoManutencaoSchema } from "@/features/solicitacao_manutencao/schemas/solicitacaoManutencaoSchema";
import { buscarSolicitacaoManutencaoAction } from "@/features/solicitacao_manutencao/services/buscarSolicitacaoManutencao.api";
import type {
  EditarSolicitacaoManutencaoParams,
  SolicitacaoManutencaoDetalhe,
} from "@/features/solicitacao_manutencao/types/solicitacaoManutencao.types";
import { useFeedbackEntidade } from "@/hooks/useFeedbackEntidade";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ConfirmarSolicitacaoManutencaoModal } from "./ConfirmarSolicitacaoManutencaoModal";
import { DadosSolicitacaoManutencao } from "./DadosSolicitacaoManutencao";
import { EditarServicosManutencao, type ServicoEmEdicao } from "./EditarServicosManutencao";
import { InformacoesAdicionais } from "./InformacoesAdicionais";
import { InformacoesUE } from "./informacoes_ue/InformacoesUE";

export function EditarSolicitacaoManutencaoPage({ uuid }: Readonly<{ uuid: string }>) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["solicitacoes-manutencao", "detalhe", uuid],
    queryFn: () => buscarSolicitacaoManutencaoAction(uuid),
    refetchOnWindowFocus: false,
  });
  if (isPending) return <LoadingGlobal local exibir titulo="Carregando a solicitação..." />;
  if (isError)
    return (
      <div role="alert" className="space-y-3">
        <p>Não foi possível carregar a solicitação.</p>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  if (data.situacao !== "necessidade_revisao_ue" && data.situacao !== "nao_enviado_dre")
    return (
      <div className="space-y-3">
        <p role="alert">Esta solicitação não está disponível para edição na situação atual.</p>
        <Button asChild variant="outline">
          <Link href={`/solicitacao_manutencao/visualizar/${uuid}`}>Voltar</Link>
        </Button>
      </div>
    );
  return <FormularioEdicao key={uuid} solicitacao={data} />;
}

function FormularioEdicao({
  solicitacao,
}: Readonly<{ solicitacao: SolicitacaoManutencaoDetalhe }>) {
  const [tipo, setTipo] = useState(solicitacao.tipo_atendimento);
  const router = useRouter();
  const { mutateAsync: editarSolicitacao, isPending } = useEditarSolicitacaoManutencao();
  const envioEmAndamento = useRef(false);
  const enviarParaDre = useRef(false);
  const { tratarResultado, tratarErroInesperado } = useFeedbackEntidade({
    mensagemSucesso: () =>
      enviarParaDre.current
        ? "A solicitação foi enviada com sucesso."
        : "As alterações foram salvas.",
    contextoErro: "editar solicitação",
    rotaRetorno: "/solicitacao_manutencao",
    erroEmToast: true,
    redirecionarEmErro: true,
  });
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [informacoes, setInformacoes] = useState(solicitacao.informacoes_adicionais ?? "");
  const [servicos, setServicos] = useState<ServicoEmEdicao[]>(() =>
    solicitacao.servicos.map((servico, indice) => ({
      ...servico,
      chave: servico.uuid ?? String(servico.id ?? indice),
      novosArquivos: [],
    })),
  );
  const ue = solicitacao.unidade_educacional;
  const validacao = solicitacaoManutencaoSchema.safeParse({
    unidade_educacional: ue?.uuid ?? "",
    tipo_atendimento: tipo,
    informacoes_adicionais: informacoes,
    servicos: servicos.map((servico) => ({
      id: servico.chave,
      servico: servico.servico_uuid ?? "outros",
      servico_especifico: servico.servico_especifico ?? undefined,
      local_reparo: servico.local_reparo,
      descricao: servico.descricao,
      arquivos: servico.novosArquivos,
      arquivosExistentes: servico.arquivos,
    })),
  });
  const botaoDesabilitado = !validacao.success || isPending;

  async function salvar(enviar: boolean) {
    if (!validacao.success || envioEmAndamento.current) return;
    const dados = validacao.data;
    const payload: EditarSolicitacaoManutencaoParams = {
      uuid: solicitacao.uuid,
      enviar,
      unidade_educacional: dados.unidade_educacional,
      tipo_atendimento: dados.tipo_atendimento,
      informacoes_adicionais: dados.informacoes_adicionais,
      servicos: dados.servicos.map((servico, indice) => ({
        ...(servicos[indice].uuid ? { uuid: servicos[indice].uuid } : {}),
        servico: servico.servico,
        ...(servico.servico === "outros" ? { servico_especifico: servico.servico_especifico } : {}),
        local_reparo: servico.local_reparo,
        descricao: servico.descricao,
        arquivos: [
          ...(servico.arquivosExistentes ?? []).map((arquivo) => ({ uuid: arquivo.uuid })),
          ...servico.arquivos.map((arquivo): { arquivo: [File] } => ({ arquivo: [arquivo] })),
        ],
      })),
    };
    envioEmAndamento.current = true;
    enviarParaDre.current = enviar;
    try {
      const resultado = await editarSolicitacao(payload);
      if (resultado.success) setConfirmacaoAberta(false);
      tratarResultado(resultado);
    } catch (error) {
      tratarErroInesperado(error);
      router.replace("/solicitacao_manutencao");
    } finally {
      envioEmAndamento.current = false;
    }
  }
  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (validacao.success && !isPending) setConfirmacaoAberta(true);
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Editar solicitação</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/solicitacao_manutencao/`}>Cancelar</Link>
          </Button>
          <Button
            type="submit"
            disabled={botaoDesabilitado}
            variant={botaoDesabilitado ? "blocked" : "default"}
            className="disabled:pointer-events-auto disabled:cursor-not-allowed"
          >
            Salvar
          </Button>
          <Button
            type="button"
            onClick={() => void salvar(true)}
            disabled={botaoDesabilitado}
            variant={botaoDesabilitado ? "blocked" : "default"}
            className="disabled:pointer-events-auto disabled:cursor-not-allowed"
          >
            Enviar para DRE
          </Button>
        </div>
      </div>
      <InformacoesUE
        dados={{
          codesc: ue?.codigo_eol,
          tipoEscola: ue?.tipo_escola?.sigla,
          dre: ue?.diretoria_regional?.nome_curto ?? ue?.diretoria_regional?.nome,
          unidadeEducacional: ue?.nome,
          subprefeitura: ue?.subprefeitura?.nome,
          lote: ue?.lote?.nome,
          cep: ue?.dados?.cep,
          logradouro: ue?.dados?.logradouro,
          numero: ue?.dados?.numero,
          bairro: ue?.dados?.bairro,
          cidade: ue?.dados?.municipio,
          estado: ue?.dados?.uf,
        }}
      />
      <DadosSolicitacaoManutencao valor={tipo} onChange={setTipo} />
      <EditarServicosManutencao valor={servicos} onChange={setServicos} />
      {servicos.length === 0 && <FormError message="Adicione pelo menos um serviço." />}
      <InformacoesAdicionais valor={informacoes} onChange={setInformacoes} />
      <ConfirmarSolicitacaoManutencaoModal
        aberto={confirmacaoAberta}
        onOpenChange={setConfirmacaoAberta}
        onSalvar={() => void salvar(false)}
        onEnviar={() => void salvar(true)}
        processando={isPending}
      />
    </form>
  );
}
