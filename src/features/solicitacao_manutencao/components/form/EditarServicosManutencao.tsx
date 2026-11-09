"use client";

import type {
  ServicoManutencao,
  ServicoManutencaoDetalhe,
} from "@/features/solicitacao_manutencao/types/solicitacaoManutencao.types";
import { ServicosManutencao } from "./ServicosManutencao";

export type ServicoEmEdicao = ServicoManutencaoDetalhe & { chave: string; novosArquivos: File[] };

export function EditarServicosManutencao({
  valor,
  onChange,
}: Readonly<{
  valor: ServicoEmEdicao[];
  onChange: (valor: ServicoEmEdicao[]) => void;
}>) {
  const servicos: ServicoManutencao[] = valor.map((item) => ({
    id: item.chave,
    servico: item.servico_uuid ?? "outros",
    nome_servico: item.nome_servico ?? undefined,
    servico_especifico: item.servico_especifico ?? undefined,
    local_reparo: item.local_reparo,
    descricao: item.descricao,
    arquivos: item.novosArquivos,
    arquivosExistentes: item.arquivos,
  }));

  return (
    <ServicosManutencao
      valor={servicos}
      exibirGaleria
      exibirVisualizacao
      onChange={(proximos) =>
        onChange(
          proximos.map((item) => {
            const original = valor.find((servico) => servico.chave === item.id);
            const nomeOriginal =
              original?.servico_uuid === item.servico ? original.nome_servico : null;
            const nomeServico =
              item.servico === "outros" ? null : (item.nome_servico ?? nomeOriginal);
            return {
              ...original,
              chave: item.id,
              servico_uuid: item.servico === "outros" ? null : item.servico,
              nome_servico: nomeServico,
              servico_especifico: item.servico === "outros" ? (item.servico_especifico ?? "") : "",
              local_reparo: item.local_reparo,
              descricao: item.descricao,
              arquivos: item.arquivosExistentes ?? [],
              novosArquivos: item.arquivos,
            };
          }),
        )
      }
    />
  );
}
