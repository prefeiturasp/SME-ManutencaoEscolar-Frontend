import type { SolicitacaoManutencaoDetalhe } from "@/features/solicitacao_manutencao/types/solicitacaoManutencao.types";
import { DadosSolicitacaoManutencao } from "./DadosSolicitacaoManutencao";
import { InformacoesAdicionais } from "./InformacoesAdicionais";
import { VisualizarServicosManutencao } from "./VisualizarServicosManutencao";
import { InformacoesUE } from "./informacoes_ue/InformacoesUE";

export function DetalhesSolicitacaoManutencao({
  solicitacao,
  hrefEditar,
}: Readonly<{ solicitacao: SolicitacaoManutencaoDetalhe; hrefEditar?: string }>) {
  const ue = solicitacao.unidade_educacional;
  return (
    <>
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
      <DadosSolicitacaoManutencao valor={solicitacao.tipo_atendimento} somenteLeitura />
      <VisualizarServicosManutencao servicos={solicitacao.servicos} hrefEditar={hrefEditar} />
      <InformacoesAdicionais valor={solicitacao.informacoes_adicionais} somenteLeitura />
    </>
  );
}
