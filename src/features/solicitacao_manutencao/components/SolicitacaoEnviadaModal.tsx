"use client";

import { Check, Copy, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";
import type { ModalCodigoProps } from "../types/solicitacao.types";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSolicitacaoEnviadaStore } from "../stores/useSolicitacaoEnviadaStore";

function ModalCodigo({ codigo, enviada, onFechar }: ModalCodigoProps) {
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState("");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(String(codigo));
      setCopiado(true);
      setErro("");
    } catch {
      setErro("Não foi possível copiar. Selecione o número e copie manualmente.");
    }
  }

  return (
    <Dialog.Root open onOpenChange={onFechar}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-[744px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-6 text-gray shadow-lg">
          <Dialog.Title className="pr-8 text-lg font-semibold">
            {enviada ? "Solicitação enviada com sucesso!" : "Solicitação criada com sucesso!"}
          </Dialog.Title>
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Fechar modal"
              className="absolute right-5 top-5 rounded p-1 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </Dialog.Close>
          <Dialog.Description className="mt-8 text-sm">
            Este é o número da sua ordem de serviço:
          </Dialog.Description>
          <div className="mt-2 flex items-center justify-between gap-4 rounded-lg bg-primary/10 px-3 py-2">
            <span className="min-w-0 select-text break-all text-lg font-semibold">{codigo}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Copiar número"
                  onClick={() => void copiar()}
                  className="shrink-0 text-primary"
                >
                  {copiado ? (
                    <Check className="size-5" aria-hidden="true" />
                  ) : (
                    <Copy className="size-5" aria-hidden="true" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copiado ? "Número copiado" : "Copiar número"}</TooltipContent>
            </Tooltip>
          </div>
          {erro && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {erro}
            </p>
          )}
          <div className="mt-8 flex justify-end">
            <Dialog.Close asChild>
              <Button type="button">Fechar</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function SolicitacaoEnviadaModal() {
  const codigo = useSolicitacaoEnviadaStore((state) => state.codigo);
  const enviada = useSolicitacaoEnviadaStore((state) => state.enviada);
  const fechar = useSolicitacaoEnviadaStore((state) => state.fechar);
  return codigo === null ? null : (
    <ModalCodigo codigo={codigo} enviada={enviada} onFechar={fechar} />
  );
}
