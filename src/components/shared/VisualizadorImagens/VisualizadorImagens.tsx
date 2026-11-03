"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ArquivoVisualizacao = {
  arquivo: string;
  nome?: string;
  descricao?: string;
};

export type VisualizadorImagensProps = {
  arquivos: readonly ArquivoVisualizacao[];
  titulo?: string;
};

export function VisualizadorImagens({ arquivos, titulo = "Imagens" }: VisualizadorImagensProps) {
  const [indiceSelecionado, setIndiceSelecionado] = useState(0);
  const indice = Math.min(indiceSelecionado, Math.max(arquivos.length - 1, 0));
  const arquivo = arquivos[indice];
  const url = arquivo?.arquivo ?? "";
  const seguro = /^(https?:\/\/|\/(?!\/))/i.test(url);
  const imagem = /\.(png|jpe?g|webp|gif)(?:[?#]|$)/i.test(url);
  const nomeArquivo =
    arquivo?.nome ?? (url.split(/[?#]/)[0].split("/").pop() || `Anexo ${indice + 1}`);

  return (
    <section aria-label={titulo} className="min-w-0 space-y-4">
      <h3 className="text-sm font-semibold">{titulo}</h3>
      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-muted">
        {seguro ? (
          imagem ? (
            <img
              src={url}
              alt={arquivo?.descricao ?? `Imagem ${indice + 1}`}
              className="h-full w-full object-contain"
            />
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Visualizar documento
            </a>
          )
        ) : (
          <p className="text-sm">{arquivo ? "Anexo indisponível." : "Nenhum anexo."}</p>
        )}
      </div>
      {arquivos.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Anexo anterior"
              disabled={indice === 0}
              onClick={() => setIndiceSelecionado(indice - 1)}
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
              className="rounded-full"
              aria-label="Próximo anexo"
              disabled={indice === arquivos.length - 1}
              onClick={() => setIndiceSelecionado(indice + 1)}
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
