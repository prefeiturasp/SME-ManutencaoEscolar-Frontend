"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ArquivoVisualizacao = {
  arquivo: string;
  nome?: string;
  descricao?: string;
};

export type VisualizadorImagensProps = Readonly<{
  arquivos: readonly ArquivoVisualizacao[];
  titulo?: string;
  indiceAtual?: number;
  onIndiceChange?: (indice: number) => void;
}>;

export function VisualizadorImagens({
  arquivos,
  titulo = "Imagens",
  indiceAtual,
  onIndiceChange,
}: VisualizadorImagensProps) {
  const [indiceSelecionado, setIndiceSelecionado] = useState(0);
  const indice = Math.min(indiceAtual ?? indiceSelecionado, Math.max(arquivos.length - 1, 0));
  function selecionar(proximo: number) {
    setIndiceSelecionado(proximo);
    onIndiceChange?.(proximo);
  }
  const arquivo = arquivos[indice];
  const url = arquivo?.arquivo ?? "";
  const seguro = /^(https?:\/\/|\/(?!\/))/i.test(url);
  const imagem = /\.(png|jpe?g|webp|gif)(?:[?#]|$)/i.test(url);
  const nomeArquivo =
    arquivo?.nome ?? (url.split(/[?#]/)[0].split("/").pop() || `Anexo ${indice + 1}`);

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
    <section aria-label={titulo} className="min-w-0 space-y-4">
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
          <p className="break-all rounded-md bg-muted/60 px-3 py-2 text-sm font-semibold">
            {nomeArquivo}
          </p>
        </>
      )}
    </section>
  );
}
