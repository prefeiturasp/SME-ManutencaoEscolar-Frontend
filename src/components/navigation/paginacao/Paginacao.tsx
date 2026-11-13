"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PropriedadesPaginacao } from "./types/Paginacao.types";

export function Paginacao({
  paginaAtual,
  totalRegistros,
  registrosPorPagina,
  onMudarPagina,
  onMudarRegistrosPorPagina,
}: Readonly<PropriedadesPaginacao>) {
  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);

  if (totalRegistros === 0) {
    return null;
  }

  const limitePaginasVisiveis = 9;

  const primeiraPaginaVisivel =
    paginaAtual <= limitePaginasVisiveis
      ? 1
      : paginaAtual - limitePaginasVisiveis + 1;

  const ultimaPaginaVisivel = Math.min(
    primeiraPaginaVisivel + limitePaginasVisiveis - 1,
    totalPaginas,
  );

  const paginasVisiveis = Array.from(
    { length: ultimaPaginaVisivel - primeiraPaginaVisivel + 1 },
    (_, indice) => primeiraPaginaVisivel + indice,
  );

  const primeiroRegistro = (paginaAtual - 1) * registrosPorPagina + 1;

  const ultimoRegistro = Math.min(
    paginaAtual * registrosPorPagina,
    totalRegistros,
  );

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center pt-2">
      <span className="text-sm text-muted-foreground">
        Mostrando {primeiroRegistro}-{ultimoRegistro} de {totalRegistros}{" "}
        registro(s)
      </span>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={paginaAtual === 1}
          aria-label="Página anterior"
          onClick={() => {
            onMudarPagina(paginaAtual - 1);
          }}
        >
          <ChevronLeft className="size-4" />
        </Button>

        {paginasVisiveis.map((pagina) => (
          <Button
            key={pagina}
            type="button"
            variant={pagina === paginaAtual ? "outline" : "ghost"}
            size="icon"
            aria-label={`Ir para a página ${pagina}`}
            aria-current={pagina === paginaAtual ? "page" : undefined}
            onClick={() => {
              onMudarPagina(pagina);
            }}
          >
            {pagina}
          </Button>
        ))}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={paginaAtual === totalPaginas}
          aria-label="Próxima página"
          onClick={() => {
            onMudarPagina(paginaAtual + 1);
          }}
        >
          <ChevronRight className="size-4" />
        </Button>

        <Select
          value={String(registrosPorPagina)}
          onValueChange={(valor) => {
            onMudarRegistrosPorPagina(Number(valor));
          }}
        >
          <SelectTrigger className="w-20" aria-label="Registros por página">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div aria-hidden="true" />
    </div>
  );
}
