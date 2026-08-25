import { PencilIcon } from "@/components/icons/PincelCustom";
import type { ColunaTabela } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";
import { Button } from "@/components/ui/button";

import { ErrorCircleIcon } from "@/components/icons/Close";
import { SuccessCircleIcon } from "@/components/icons/SimboloAprovado";
import type {
  CriarColunasLoteParams,
  Lote,
} from "@/features/lotes/types/lotes.types";

function formatarData(data?: string | null): string {
  if (!data) {
    return "-";
  }

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
}

function obterNomesDiretoriasRegionais(lote: Lote): string {
  if (!lote.diretorias_regionais?.length) {
    return "-";
  }

  return lote.diretorias_regionais
    .map((diretoriaRegional) => diretoriaRegional.nome_curto)
    .join(", ");
}

function formatarNomeDre(nome: string): string {
  const nomeSemPrefixo = nome
    .replace(/^DRE\s*/i, "")
    .toLocaleLowerCase("pt-BR");

  const nomeFormatado = nomeSemPrefixo.replace(
    /(^|[\s/-])(\p{L})/gu,
    (_, separador: string, letra: string) =>
      `${separador}${letra.toLocaleUpperCase("pt-BR")}`,
  );

  return `DRE ${nomeFormatado}`;
}

function renderizarPeriodo(lote: Lote) {
  if (!lote.periodo_inicial && !lote.periodo_final) {
    return "-";
  }

  return (
    <div className="flex flex-col whitespace-nowrap leading-4">
      <span>{formatarData(lote.periodo_inicial)} à</span>

      <span>{formatarData(lote.periodo_final)}</span>
    </div>
  );
}

export function criarColunasLote({
  onEditar,
}: CriarColunasLoteParams): ColunaTabela<Lote>[] {
  return [
    {
      id: "codigo_cadastro",
      titulo: "Código de cadastro",
      classNameCabecalho: "text-left font-bold whitespace-nowrap text-gray",
      classNameCelula: (lote) =>
        lote.status
          ? "whitespace-nowrap text-gray"
          : "whitespace-nowrap text-blocked-foreground",
      renderizar: (lote) => lote.codigo_cadastro ?? "-",
    },
    {
      id: "nome",
      titulo: "Nome do lote",
      classNameCabecalho:
        "w-[120px] whitespace-nowrap border-l text-left font-bold text-gray",
      classNameCelula: (lote) =>
        lote.status
          ? "border-l px-2 whitespace-nowrap text-gray"
          : "border-l px-2 whitespace-nowrap text-blocked-foreground",
      renderizar: (lote) => lote.nome ?? "-",
    },
    {
      id: "diretorias_regionais",
      titulo: "DREs",
      classNameCabecalho:
        "min-w-[420px] border-l text-left font-bold text-gray",
      classNameCelula: (lote) =>
        lote.status
          ? "border-l px-2 text-gray"
          : "border-l px-2 text-blocked-foreground",
      renderizar: (lote) => {
        const diretoriasRegionais = lote.diretorias_regionais ?? [];

        if (diretoriasRegionais.length === 0) {
          return "-";
        }

        return (
          <div className="flex min-w-[420px] flex-wrap gap-1">
            {diretoriasRegionais.map((diretoria) => (
              <span
                key={diretoria.id}
                className={[
                  "inline-flex items-center whitespace-nowrap",
                  "rounded-md bg-[#EEEEEE] px-2 py-1",
                  "text-sm font-normal",
                  lote.status
                    ? "text-[var(--gray)]"
                    : "text-blocked-foreground",
                ].join(" ")}
              >
                {formatarNomeDre(diretoria.nome_curto || diretoria.nome)}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      id: "status",
      titulo: "Status",
      classNameCabecalho: "w-23.5 border-l text-left font-bold text-gray",
      classNameCelula: (lote) =>
        lote.status
          ? "border-l px-2 text-gray"
          : "border-l px-2 text-blocked-foreground",
      renderizar: (lote) => (
        <div className="flex items-center gap-1 whitespace-nowrap">
          {lote.status ? (
            <SuccessCircleIcon className="size-4 text-[#8DC773]" />
          ) : (
            <ErrorCircleIcon className="size-4 text-[#FD756D]" />
          )}

          {lote.status ? "Ativo" : "Inativo"}
        </div>
      ),
    },
    {
      id: "empresa",
      titulo: "Empresa",
      classNameCabecalho: "border-l text-left font-bold text-gray",
      classNameCelula: (lote) =>
        lote.status
          ? "border-l px-2 text-gray"
          : "border-l px-2 text-blocked-foreground",
      renderizar: (lote) => lote.empresa?.nome ?? "-",
    },
    {
      id: "periodo",
      titulo: "Período da licitação",
      classNameCabecalho: "w-[140px] border-l text-left font-bold text-gray",
      classNameCelula: (lote) =>
        lote.status
          ? "border-l px-2 text-gray"
          : "border-l px-2 text-blocked-foreground",
      renderizar: renderizarPeriodo,
    },
    {
      id: "acoes",
      tituloAcessivel: "Ações",
      classNameCabecalho: "w-16 border-l",
      classNameCelula: "border-l px-2 py-2 text-center",
      renderizar: (lote) => (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Editar ${lote.nome ?? "lote"}`}
          className="border border-primary-dark"
          onClick={() => {
            onEditar(lote);
          }}
        >
          <PencilIcon className="size-4" />
        </Button>
      ),
    },
  ];
}
