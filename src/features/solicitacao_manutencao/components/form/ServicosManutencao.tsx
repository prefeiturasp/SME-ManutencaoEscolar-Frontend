"use client";

import type {
  ServicoManutencao,
  ServicosManutencaoProps,
} from "@/features/solicitacao_manutencao/types/solicitacaoManutencao.types";
import { Pencil, Search, Trash2, Wrench } from "lucide-react";
import { useState } from "react";

import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useOpcoesServicos } from "@/features/servico/hooks/useOpcoesServicos";
import { AdicionarServicoManutencaoModal } from "./AdicionarServicoManutencaoModal";

export function ServicosManutencao({
  valor,
  onChange,
  exibirGaleria = false,
  exibirVisualizacao = false,
}: ServicosManutencaoProps) {
  const { data: opcoes = [], isPending, isError, refetch } = useOpcoesServicos();
  const [aberto, setAberto] = useState(false);
  const [somenteLeitura, setSomenteLeitura] = useState(false);
  const [servicoManutencaoEmEdicao, setServicoManutencaoEmEdicao] = useState<ServicoManutencao>();
  const [servicosInternos, setServicosInternos] = useState<ServicoManutencao[]>([]);
  const servicos = valor ?? servicosInternos;

  function atualizar(proximos: ServicoManutencao[]) {
    setServicosInternos(proximos);
    onChange?.(proximos);
  }

  return (
    <Card>
      <section aria-label="Serviços de manutenção" className="space-y-4 p-2 text-gray">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Serviços de manutenção</h2>
            <p className="text-sm">Adicione o serviço que precisa ser executado.</p>
          </div>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => {
              setServicoManutencaoEmEdicao(undefined);
              setSomenteLeitura(false);
              setAberto(true);
            }}
          >
            <PlusIcon />
            Adicionar serviço
          </Button>
        </div>
        {isPending && <output className="block text-sm">Carregando serviços...</output>}
        {isError && (
          <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-destructive">
            <p>Não foi possível carregar os serviços. Você pode adicionar um serviço em Outros.</p>
            <Button type="button" variant="outline" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          </div>
        )}
        {!isPending && !isError && opcoes.length === 0 && (
          <p className="text-sm">Nenhum serviço ativo disponível.</p>
        )}
        {servicos.length === 0 ? (
          <div className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-md border bg-muted/50 p-6 text-center text-sm">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Wrench className="size-5 -scale-x-100" aria-hidden="true" />
            </span>
            <p className="font-semibold">Nenhum serviço foi adicionado.</p>
            <p>Clique em &quot;Adicionar serviço&quot; para adicionar o primeiro serviço.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-gray-light">
            <table
              aria-label="Serviços adicionados"
              className="w-full min-w-[640px] table-fixed border-collapse text-left text-sm"
            >
              <colgroup>
                <col className="w-12" />
                <col />
                <col />
                <col />
                <col className={exibirVisualizacao ? "w-32" : "w-[88px]"} />
              </colgroup>
              <thead className="border-b border-gray-light bg-white-smoke">
                <tr>
                  <th scope="col" className="w-12 border-r border-gray-light p-3">
                    <span className="sr-only">Número</span>
                  </th>
                  <th scope="col" className="border-r border-gray-light p-3 font-semibold">
                    Serviço
                  </th>
                  <th scope="col" className="border-r border-gray-light p-3 font-semibold">
                    Local
                  </th>
                  <th scope="col" className="border-r border-gray-light p-3 font-semibold">
                    Fotos
                  </th>
                  <th scope="col" className="p-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {servicos.map((servico, indice) => (
                  <tr key={servico.id} className="border-t border-gray-light">
                    <td className="border-r border-gray-light p-3">
                      {String(indice + 1).padStart(2, "0")}
                    </td>
                    <td className="border-r border-gray-light p-3">
                      {servico.servico === "outros"
                        ? servico.servico_especifico
                        : (opcoes.find((opcao) => opcao.value === servico.servico)?.label ??
                          servico.nome_servico ??
                          servico.servico)}
                    </td>
                    <td className="border-r border-gray-light p-3">{servico.local_reparo}</td>
                    <td className="border-r border-gray-light p-3">
                      {servico.arquivos.length + (servico.arquivosExistentes?.length ?? 0)}
                    </td>
                    <td className="p-2">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="size-8 border-destructive p-0 text-destructive"
                          aria-label={`Remover serviço de ${servico.local_reparo}`}
                          onClick={() =>
                            atualizar(servicos.filter((item) => item.id !== servico.id))
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="size-8 p-0 text-primary"
                          aria-label={`Editar serviço de ${servico.local_reparo}`}
                          onClick={() => {
                            setSomenteLeitura(false);
                            setServicoManutencaoEmEdicao(servico);
                            setAberto(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        {exibirVisualizacao && (
                          <Button
                            type="button"
                            variant="outline"
                            className="size-8 p-0 text-primary"
                            aria-label={`Visualizar serviço de ${servico.local_reparo}`}
                            onClick={() => {
                              setServicoManutencaoEmEdicao(servico);
                              setSomenteLeitura(true);
                              setAberto(true);
                            }}
                          >
                            <Search className="size-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {aberto && (
        <AdicionarServicoManutencaoModal
          aberto={aberto}
          exibirGaleria={exibirGaleria}
          somenteLeitura={somenteLeitura}
          onOpenChange={setAberto}
          opcoes={opcoes}
          servicoInicial={servicoManutencaoEmEdicao}
          onAdicionar={(servico) =>
            atualizar(
              servicoManutencaoEmEdicao
                ? servicos.map((item) => (item.id === servico.id ? servico : item))
                : [...servicos, servico],
            )
          }
        />
      )}
    </Card>
  );
}
