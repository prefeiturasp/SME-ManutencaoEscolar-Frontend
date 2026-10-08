import { ErrorCircleIcon } from "@/components/icons/Close";
import { PencilIcon } from "@/components/icons/PincelCustom";
import { SuccessCircleIcon } from "@/components/icons/SimboloAprovado";
import type { ColunaTabela } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";
import { Button } from "@/components/ui/button";
import type { CriarColunasEquipeParams, Equipe } from "../../types/equipe.types";

function formatarData(data?: string | null) {
  return data ? data.slice(0, 10).split("-").reverse().join("/") : "-";
}

export function criarColunasEquipe({ onEditar }: CriarColunasEquipeParams): ColunaTabela<Equipe>[] {
  const estilo = {
    classNameCabecalho: "border-l text-left font-bold",
    classNameCelula: (equipe: Equipe) =>
      equipe.situacao ? "border-l text-gray" : "border-l text-blocked-foreground",
  };
  return [
    {
      id: "nome",
      titulo: "Nome da equipe",
      classNameCabecalho: "w-[37%] text-left font-bold",
      classNameCelula: (equipe) => (equipe.situacao ? "text-gray" : "text-blocked-foreground"),
      renderizar: (equipe) => equipe.nome,
    },
    {
      id: "empresa",
      titulo: "Empresa",
      ...estilo,
      classNameCabecalho: `${estilo.classNameCabecalho} w-[37%]`,
      renderizar: (equipe) => equipe.nome_empresa,
    },
    {
      id: "lote",
      titulo: "Lote",
      ...estilo,
      renderizar: (equipe) =>
        typeof equipe.lote === "object" ? (
          <div className="whitespace-nowrap leading-4">
            <div>{equipe.lote.nome || equipe.lote.codigo_cadastro || "-"}</div>
            {(equipe.lote.periodo_inicial || equipe.lote.periodo_final) && (
              <div>
                {formatarData(equipe.lote.periodo_inicial)} à{" "}
                {formatarData(equipe.lote.periodo_final)}
              </div>
            )}
          </div>
        ) : (
          "-"
        ),
    },
    {
      id: "situacao",
      titulo: "Situação",
      ...estilo,
      renderizar: (equipe) => (
        <div className="flex items-center gap-1 whitespace-nowrap">
          {equipe.situacao ? (
            <SuccessCircleIcon className="size-4 text-[#8DC773]" />
          ) : (
            <ErrorCircleIcon className="size-4 text-[#FD756D]" />
          )}
          {equipe.situacao ? "Ativo" : "Inativo"}
        </div>
      ),
    },
    {
      id: "acoes",
      tituloAcessivel: "Ações",
      classNameCabecalho: "w-12 min-w-12 max-w-12 border-l px-1",
      classNameCelula: "w-12 min-w-12 max-w-12 border-l px-1 py-2 text-center",
      renderizar: (equipe) => (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Editar ${equipe.nome}`}
          className="border border-primary-dark"
          onClick={() => onEditar(equipe)}
        >
          <PencilIcon className="size-4" />
        </Button>
      ),
    },
  ];
}
