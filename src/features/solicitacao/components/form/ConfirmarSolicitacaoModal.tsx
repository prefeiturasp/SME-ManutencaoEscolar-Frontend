"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";

import { Button } from "@/components/ui/button";

type ConfirmarSolicitacaoModalProps = Readonly<{
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  onSalvar: () => void;
  onEnviar: () => void;
  processando?: boolean;
  erro?: string;
}>;

const opcoes = [
  {
    titulo: "Revisar informações",
    descricao: "Confira se todas as informações estão corretas antes de enviar para aprovação.",
  },
  {
    titulo: "Salvar e continuar depois",
    descricao: "A solicitação ficará salva no sistema e não será enviada para aprovação.",
  },
  {
    titulo: "Enviar para aprovação",
    descricao: "A solicitação será enviada agora para análise da DRE.",
  },
];

export function ConfirmarSolicitacaoModal({
  aberto,
  onOpenChange,
  onSalvar,
  onEnviar,
  processando = false,
  erro,
}: ConfirmarSolicitacaoModalProps) {
  return (
    <Dialog.Root
      open={aberto}
      onOpenChange={(valor) => {
        if (!processando) onOpenChange(valor);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          aria-busy={processando}
          className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-6 text-gray shadow-lg"
        >
          <Dialog.Title className="pr-8 text-lg font-semibold">Enviar para aprovação?</Dialog.Title>
          <Dialog.Close asChild>
            <button
              type="button"
              disabled={processando}
              aria-label="Fechar"
              className="absolute cursor-pointer right-5 top-5 rounded p-1 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
            >
              <X className="size-5" />
            </button>
          </Dialog.Close>
          <Dialog.Description className="mt-6 text-sm">
            Esta solicitação ainda não foi enviada para aprovação da DRE. Você pode manter a
            solicitação salva no sistema e continuar depois ou enviar agora para análise.
          </Dialog.Description>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {opcoes.map((opcao) => (
              <div key={opcao.titulo} className="space-y-2 rounded-md bg-primary/10 p-3 text-sm">
                <p className="font-semibold text-primary">{opcao.titulo}</p>
                <p>{opcao.descricao}</p>
              </div>
            ))}
          </div>
          {erro && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {erro}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Dialog.Close asChild>
              <Button type="button" variant="outline" disabled={processando}>
                Revisar informações
              </Button>
            </Dialog.Close>
            <Button type="button" variant="outline" disabled={processando} onClick={onSalvar}>
              Salvar e continuar depois
            </Button>
            <Button type="button" disabled={processando} onClick={onEnviar}>
              {processando ? "Processando..." : "Enviar para aprovação"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
