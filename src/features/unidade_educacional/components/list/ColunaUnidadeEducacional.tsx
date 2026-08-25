import { ErrorCircleIcon } from "@/components/icons/Close";
import { PencilIcon } from "@/components/icons/PincelCustom";
import { SuccessCircleIcon } from "@/components/icons/SimboloAprovado";
import type { ColunaTabela } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";
import { Button } from "@/components/ui/button";
import { CriarColunasUnidadeEducacionalParams, UnidadeEducacional } from "@/features/unidade_educacional/types/unidadesEducacionais.types";

export function criarColunasUnidadeEducacional({
    onEditar, 
}: CriarColunasUnidadeEducacionalParams): ColunaTabela<UnidadeEducacional>[] {

  return [
    {
      id: "codigo",
      titulo: "CODESC (Código EOL)",
      classNameCabecalho: "w-[99px] min-w-[99px] max-w-[99px] border-l px-1",
      classNameCelula: (unidade) =>
        unidade.status ? "text-[var(--gray)]" : "text-blocked-foreground",
      renderizar: (unidade) => unidade.codigo_eol,
    },
    {
      id: "tipo",
      titulo: "Tipo de escola",
      classNameCabecalho: "w-[108px] min-w-[108px] max-w-[108px] border-l px-1",
      classNameCelula: (unidade) =>
        unidade.status ? "border-l text-[var(--gray)]" : "border-ltext-blocked-foreground",
      renderizar: (unidade) => unidade.tipo_escola?.sigla,
    },
    {
      id: "unidade",
      titulo: "Unidade Educacional",
      classNameCabecalho: "w-[324.5px] min-w-[324.5px] max-w-[324.5px] border-l px-1",
      classNameCelula: (unidade) =>
        unidade.status ? "border-l text-[var(--gray)]" : "border-l text-blocked-foreground",
      renderizar: (unidade) => unidade.nome,
    },
    {
      id: "diretoria_regional",
      titulo: "Diretoria Regional (DRE)",
      classNameCabecalho: "w-[182px] min-w-[182px] max-w-[182px] border-l px-1",
      classNameCelula: (unidade) =>
        unidade.status ? "border-l text-[var(--gray)]" : "border-l text-blocked-foreground",
      renderizar: (unidade) => unidade.diretoria_regional?.nome_curto,
    },
    {
      id: "subprefeitura",
      titulo: "Subprefeitura",
      classNameCabecalho: "w-[324.5px] min-w-[324.5px] max-w-[324px] border-l px-1",
      classNameCelula: (unidade) =>
        unidade.status ? "border-l text-[var(--gray)]" : "border-l text-blocked-foreground",
      renderizar: (unidade) => unidade.subprefeitura?.nome,
    },
    {
      id: "lote",
      titulo: "Lote",
      classNameCabecalho: "w-[71px] min-w-[71px] max-w-[71px] border-l px-1",
      classNameCelula: (unidade) =>
        unidade.status ? "border-l text-[var(--gray)]" : "border-l text-blocked-foreground",
      renderizar: (unidade) => unidade.lote?.nome,
    },
    {
      id: "status",
      titulo: "Status",
      classNameCabecalho: "w-[78px] min-w-[78px] max-w-[78px] border-l px-1",
      classNameCelula: (unidade) =>
        unidade.status
          ? "border-l px-2 text-[var(--gray)]"
          : "border-l px-2 text-blocked-foreground",
      renderizar: (unidade) => (
        <div className="flex items-center gap-1">
          {unidade.status ? (
            <SuccessCircleIcon className="size-4 text-[#8DC773]" />
          ) : (
            <ErrorCircleIcon className="size-4 text-[#FD756D]" />
          )}

          {unidade.status ? "Ativo" : "Inativo"}
        </div>
      ),
    },
    {
      id: "acoes",
      tituloAcessivel: "Ações",
      classNameCabecalho: "w-12 min-w-12 max-w-12 border-l px-1",
      classNameCelula: "w-12 min-w-12 max-w-12 border-l px-1 py-2 text-center",
      renderizar: (unidade) => (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Editar ${unidade.nome}`}
          className="size-9 border border-[var(--color-primary-dark)]"
          onClick={() => {
            onEditar(unidade);
          }}
          disabled
        >
          <PencilIcon className="size-4" />
        </Button>
      ),
    },
  ];
}
