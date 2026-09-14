"use client";

import { Download, Paperclip, Trash2 } from "lucide-react";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { toastErro } from "@/components/ui/toast-custom";
import { formatarDataHora } from "@/utils/formatadores";
import type { Anexo } from "@/features/empresa/types/anexo.type";
import { cn } from "@/lib/utils";

interface ArquivosCardProps {
  readonly anexos: Anexo[];
  readonly onRemover: (index: number) => void;
}

async function baixarArquivo(
  event: MouseEvent<HTMLAnchorElement>,
  anexo: Anexo,
) {
  event.preventDefault();

  if (!anexo.arquivo_url) {
    return;
  }

  try {
    const resposta = await fetch(anexo.arquivo_url, {
      credentials: "include",
    });

    if (!resposta.ok) {
      throw new Error(`Falha no download: HTTP ${resposta.status}`);
    }

    const urlTemporaria = URL.createObjectURL(await resposta.blob());
    const link = document.createElement("a");

    link.href = urlTemporaria;
    link.download = anexo.nome;
    link.hidden = true;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(urlTemporaria), 0);
  } catch {
    toastErro({
      titulo: "Erro ao baixar arquivo",
      descricao: "Não foi possível baixar o arquivo. Tente novamente.",
    });
  }
}

export function ArquivosCard({ anexos, onRemover }: ArquivosCardProps) {
  if (!anexos || anexos.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {anexos.map((anexo, index) => (
        <div
          key={anexo.uuid || index}
          className="flex min-h-40 flex-col justify-between gap-6 rounded-md border border-input bg-white p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded bg-[#E8F0FE] text-primary">
              <Paperclip className="size-4" aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-gray">
                {anexo.nome}
              </p>

              {(anexo.anexado_por || anexo.anexado_em) && (
                <div className="mt-2 flex items-start justify-between gap-3 text-xs leading-4 text-[#BFBFC2]">
                  {anexo.anexado_por && (
                    <p className="min-w-0">Anexado por: {anexo.anexado_por}</p>
                  )}
                  {anexo.anexado_em && (
                    <time
                      className="shrink-0 whitespace-nowrap"
                      dateTime={anexo.anexado_em}
                    >
                      {formatarDataHora(anexo.anexado_em)}
                    </time>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => onRemover(index)}
              className={cn(
                "h-10 w-full border border-destructive bg-white",
                !anexo.arquivo_url && "sm:col-span-2 max-w-full",
              )}
              aria-label={`Remover arquivo ${anexo.nome}`}
            >
              <Trash2 className="size-5" />
              Excluir arquivo
            </Button>

            {anexo.arquivo_url && (
              <Button
                asChild
                variant="outline"
                className={cn("h-10 w-full bg-white")}
              >
                <a
                  href={anexo.arquivo_url}
                  download={anexo.nome}
                  onClick={(event) => baixarArquivo(event, anexo)}
                  aria-label={`Baixar arquivo ${anexo.nome}`}
                >
                  <Download className="size-5" />
                  Baixar arquivo
                </a>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
