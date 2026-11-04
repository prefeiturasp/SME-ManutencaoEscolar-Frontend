"use client";

import { VisualizadorImagens } from "@/components/shared/VisualizadorImagens/VisualizadorImagens";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Pencil, Search, X } from "lucide-react";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { useId, useState } from "react";
import type { SolicitacaoManutencaoDetalhe } from "../../types/solicitacaoManutencao.types";

type Servico = SolicitacaoManutencaoDetalhe["servicos"][number];

export function VisualizarServicosManutencao({
  servicos,
  hrefEditar,
}: {
  servicos: Servico[];
  hrefEditar?: string;
}) {
  const [selecionado, setSelecionado] = useState<Servico>();
  function rotulo(servico: Servico) {
    return servico.nome_servico?.trim() || servico.servico_especifico?.trim() || "Não informado";
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
          hrefEditar={hrefEditar}
        />
      )}
    </Card>
  );
}

function VisualizarServicoModal({
  servico,
  nome,
  onFechar,
  hrefEditar,
}: {
  servico: Servico;
  nome: string;
  onFechar: () => void;
  hrefEditar?: string;
}) {
  const id = useId();
  const [indice, setIndice] = useState(0);
  const [baixando, setBaixando] = useState(false);
  const [erroDownload, setErroDownload] = useState("");
  const url = servico.arquivos[indice]?.arquivo ?? "";
  const podeBaixar = /^(https?:\/\/|\/(?!\/))/i.test(url);

  async function baixar() {
    if (!podeBaixar || baixando) return;
    setBaixando(true);
    setErroDownload("");
    try {
      const resposta = await fetch(url);
      if (!resposta.ok) throw new Error("Falha ao baixar");
      const blob = await resposta.blob();
      const temporaria = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = temporaria;
      link.download = url.split(/[?#]/)[0].split("/").pop() || "imagem";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(temporaria);
    } catch {
      setErroDownload("Não foi possível baixar o arquivo. Tente novamente.");
    } finally {
      setBaixando(false);
    }
  }

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
              className="absolute cursor-pointer right-5 top-5 rounded p-1 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <X className="size-5" />
            </button>
          </Dialog.Close>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="space-y-1">
                <Label htmlFor={`${id}-servico`}>Qual o serviço?</Label>
                <Input
                  id={`${id}-servico`}
                  value={nome}
                  readOnly
                  className="bg-[#F5F5F5] read-only:cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${id}-local`}>Qual local necessita do reparo?</Label>
                <Input
                  id={`${id}-local`}
                  value={servico.local_reparo}
                  readOnly
                  className="bg-[#F5F5F5] read-only:cursor-not-allowed"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor={`${id}-descricao`}>Breve descrição do serviço</Label>
                <textarea
                  id={`${id}-descricao`}
                  value={servico.descricao}
                  readOnly
                  className="min-h-48 w-full flex-1 resize-none rounded-md border border-input bg-[#F5F5F5] p-3 text-sm read-only:cursor-not-allowed"
                />
              </div>
            </div>
            <VisualizadorImagens
              arquivos={servico.arquivos}
              indiceAtual={indice}
              onIndiceChange={setIndice}
            />
          </div>
          {erroDownload && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {erroDownload}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              {hrefEditar ? (
                <Button asChild variant="outline">
                  <Link href={hrefEditar}>
                    <Pencil className="size-4" />
                    Editar
                  </Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled
                  className="disabled:pointer-events-auto disabled:cursor-not-allowed"
                >
                  <Pencil className="size-4" />
                  Editar
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!podeBaixar || baixando}
                className="disabled:pointer-events-auto disabled:cursor-not-allowed"
                onClick={() => void baixar()}
              >
                <Download className="size-4" />
                {baixando ? "Baixando..." : "Baixar imagem"}
              </Button>
              <Dialog.Close asChild>
                <Button type="button">Fechar</Button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
