"use client";

import { useId, useState } from "react";
import { Search, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VisualizadorImagens } from "@/components/shared/VisualizadorImagens/VisualizadorImagens";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOpcoesServicos } from "@/features/servico/hooks/useOpcoesServicos";
import type { SolicitacaoManutencaoDetalhe } from "../../types/solicitacaoManutencao.types";

type Servico = SolicitacaoManutencaoDetalhe["servicos"][number];

export function VisualizarServicosManutencao({ servicos }: { servicos: Servico[] }) {
  const { data: opcoes = [] } = useOpcoesServicos();
  const [selecionado, setSelecionado] = useState<Servico>();
  function rotulo(servico: Servico) {
    return servico.servico === "outros"
      ? (servico.servico_especifico ?? "Outros")
      : (opcoes.find((opcao) => opcao.value === servico.servico)?.label ?? servico.servico);
  }

  return (
    <Card>
      <section aria-label="Serviços de manutenção" className="space-y-4 p-2 text-gray">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Serviços de manutenção</h2>
          <p className="text-sm">Adicione o serviço que precisa ser executado.</p>
        </div>
        {servicos.length === 0 ? (
          <p className="text-sm">Nenhum serviço foi adicionado.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-gray-light">
            <table
              aria-label="Serviços adicionados"
              className="w-full border-collapse text-left text-sm"
            >
              <thead className="border-b border-gray-light bg-white-smoke">
                <tr>
                  <th scope="col" className="w-12 border-r border-gray-light p-3">
                    <span className="sr-only">Número</span>
                  </th>
                  {["Serviço", "Local", "Fotos"].map((titulo) => (
                    <th
                      key={titulo}
                      scope="col"
                      className="border-r border-gray-light p-3 font-semibold"
                    >
                      {titulo}
                    </th>
                  ))}
                  <th scope="col" className="w-12 p-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {servicos.map((servico, indice) => (
                  <tr
                    key={servico.uuid ?? servico.id ?? `servico-${indice}`}
                    className="border-t border-gray-light"
                  >
                    <td className="border-r border-gray-light p-3">
                      {String(indice + 1).padStart(2, "0")}
                    </td>
                    <td className="border-r border-gray-light p-3">{rotulo(servico)}</td>
                    <td className="border-r border-gray-light p-3">{servico.local_reparo}</td>
                    <td className="border-r border-gray-light p-3">{servico.arquivos.length}</td>
                    <td className="p-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Visualizar serviço de ${servico.local_reparo}`}
                        onClick={() => setSelecionado(servico)}
                      >
                        <Search className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {selecionado && (
        <VisualizarServicoModal
          servico={selecionado}
          nome={rotulo(selecionado)}
          onFechar={() => setSelecionado(undefined)}
        />
      )}
    </Card>
  );
}

function VisualizarServicoModal({
  servico,
  nome,
  onFechar,
}: {
  servico: Servico;
  nome: string;
  onFechar: () => void;
}) {
  const id = useId();

  return (
    <Dialog.Root
      open
      onOpenChange={(aberto) => {
        if (!aberto) onFechar();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-6 text-gray shadow-lg">
          <Dialog.Title className="pr-8 text-lg font-semibold">Serviço de manutenção</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm">
            Informações do serviço que precisa ser executado.
          </Dialog.Description>
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Fechar"
              className="absolute right-5 top-5 rounded p-1 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <X className="size-5" />
            </button>
          </Dialog.Close>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor={`${id}-servico`}>Qual o serviço?</Label>
                <Input id={`${id}-servico`} value={nome} readOnly />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${id}-local`}>Qual local necessita do reparo?</Label>
                <Input id={`${id}-local`} value={servico.local_reparo} readOnly />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${id}-fotos`}>Fotos do local do reparo</Label>
                <Input
                  id={`${id}-fotos`}
                  value={`${servico.arquivos.length} arquivo(s)`}
                  readOnly
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${id}-descricao`}>Breve descrição do serviço</Label>
                <textarea
                  id={`${id}-descricao`}
                  value={servico.descricao}
                  readOnly
                  className="min-h-48 w-full resize-none rounded-md border border-input p-3 text-sm"
                />
              </div>
            </div>
            <VisualizadorImagens arquivos={servico.arquivos} />
          </div>
          <div className="mt-6 flex justify-end">
            <Dialog.Close asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
