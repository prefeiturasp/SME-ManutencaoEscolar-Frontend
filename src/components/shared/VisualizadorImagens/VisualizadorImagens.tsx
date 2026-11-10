"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ImageIcon, Trash2 } from "lucide-react";
import { useState } from "react";

export type ArquivoVisualizacao = {
  arquivo: string;
  nome_original?: string | null;
  nome?: string;
  descricao?: string;
};

export type VisualizadorImagensProps = Readonly<{
  arquivos: readonly ArquivoVisualizacao[];
  titulo?: string;
  indiceAtual?: number;
  onIndiceChange?: (indice: number) => void;
  onRemover?: (indice: number) => void;
  className?: string;
}>;

export function VisualizadorImagens({
  arquivos,
  titulo = "Imagens",
  indiceAtual,
  onIndiceChange,
  onRemover,
  className = "",
}: VisualizadorImagensProps) {
  const [indiceSelecionado, setIndiceSelecionado] = useState(0);
  const indice = Math.min(indiceAtual ?? indiceSelecionado, Math.max(arquivos.length - 1, 0));
  function selecionar(proximo: number) {
    setIndiceSelecionado(proximo);
    onIndiceChange?.(proximo);
  }
  const arquivo = arquivos[indice];
  const url = arquivo?.arquivo ?? "";
  const seguro = /^(https?:\/\/|blob:|\/(?!\/))/i.test(url);
  const imagem =
    /\.(png|jpe?g|webp|gif)(?:[?#]|$)/i.test(url) ||
    /\.(png|jpe?g|webp|gif)$/i.test(arquivo?.nome_original ?? arquivo?.nome ?? "");
  const nomeArquivo = arquivo?.nome_original?.trim() || arquivo?.nome || `Anexo ${indice + 1}`;

  let previa;
  if (!seguro) {
    previa = <p className="text-sm">{arquivo ? "Anexo indisponível." : "Nenhum anexo."}</p>;
  } else if (imagem) {
    previa = (
      <img
        src={url}
        alt={arquivo?.descricao ?? `Imagem ${indice + 1}`}
        className="h-full w-full object-contain"
      />
    );
  } else {
    previa = (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
        Visualizar documento
      </a>
    );
  }

  return (
    <section aria-label={titulo} className={`min-w-0 space-y-4 ${className}`}>
      <h3 className="text-sm font-semibold">{titulo}</h3>
      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-muted">
        {previa}
      </div>
      {arquivos.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full disabled:pointer-events-auto disabled:cursor-not-allowed"
              aria-label="Anexo anterior"
              disabled={indice === 0}
              onClick={() => selecionar(indice - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <p aria-live="polite" className="text-sm">
              {String(indice + 1).padStart(2, "0")} de {String(arquivos.length).padStart(2, "0")}{" "}
              arquivos
            </p>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full disabled:pointer-events-auto disabled:cursor-not-allowed"
              aria-label="Próximo anexo"
              disabled={indice === arquivos.length - 1}
              onClick={() => selecionar(indice + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3 rounded-md bg-muted/60 px-3 py-2 text-sm font-semibold">
            <ImageIcon className="size-5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1 break-all">{nomeArquivo}</span>
            {onRemover && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                aria-label={`Remover imagem ${nomeArquivo}`}
                onClick={() => onRemover(indice)}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
