import { ErrorCircleIcon } from "@/components/icons/Close";
import { PencilIcon } from "@/components/icons/PincelCustom";
import { SuccessCircleIcon } from "@/components/icons/SimboloAprovado";
import { WarningCircleIcon } from "@/components/icons/WarningCircleIcon";
import type { ColunaTabela } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  CriarColunasLoteParams,
  Lote,
} from "@/features/lotes/types/lotes.types";

import {
  calcularDiasParaVencimento,
  deveExibirAvisoVencimento,
} from "@/utils/vencimentoLote";

function formatarData(data?: string | null): string {
  if (!data) {
    return "-";
  }

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
}

function renderizarPeriodo(lote: Lote) {
  if (!lote.periodo_inicial && !lote.periodo_final) {
    return "-";
  }

  const diasParaVencimento = calcularDiasParaVencimento(lote.periodo_final);

  const mostrarAviso =
    lote.status && deveExibirAvisoVencimento(diasParaVencimento);

  const mensagem =
    diasParaVencimento === null
      ? ""
      : obterMensagemVencimento(diasParaVencimento);

  return (
    <div className="flex h-8 w-fit items-center gap-2 whitespace-nowrap">
      <div className="flex h-8 max-h-8 flex-col justify-center leading-4">
        <span>{formatarData(lote.periodo_inicial)} à</span>

        <span>{formatarData(lote.periodo_final)}</span>
      </div>

      {mostrarAviso && (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={mensagem}
                className={[
                  "inline-flex size-7 shrink-0",
                  "items-center justify-center",
                  "text-[#B40C02]",
                ].join(" ")}
              >
                <WarningCircleIcon className="size-5" />
              </button>
            </TooltipTrigger>

            <TooltipContent
              side="top"
              align="center"
              sideOffset={0}
              className={[
                "h-[59px] w-[172px]",
                "rounded-lg bg-[#262626]",
                "px-2 py-2",
                "text-sm leading-[21px]",
                "font-normal text-white",
                "shadow-lg",
                "[&_svg]:!-translate-x-1",
                "[&_svg]:!h-[7px]",
                "[&_svg]:!w-[14px]",
                "[&_svg]:!bg-[#262626]",
                "[&_svg]:!fill-[#262626]",
                "[&_svg]:!text-[#262626]",
              ].join(" ")}
            >
              <p className="w-full  text-center">{mensagem}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

function obterMensagemVencimento(dias: number): string {
  if (dias === 0) {
    return "A licitação vence hoje.";
  }
  return `Faltam ${dias} dias para o\nvencimento da licitação.`;
}

export function criarColunasLote({
  onEditar,
}: CriarColunasLoteParams): ColunaTabela<Lote>[] {
  return [
    {
      id: "codigo_cadastro",
      titulo: "Código de cadastro",
      classNameCabecalho: "text-left font-bold",
      classNameCelula: (lote) =>
        lote.status
          ? "whitespace-nowrap text-gray"
          : "whitespace-nowrap text-blocked-foreground",
      renderizar: (lote) => lote.codigo_cadastro ?? "-",
    },
    {
      id: "nome",
      titulo: "Nome do lote",
      classNameCabecalho: "border-l px-2 text-left font-bold",
      classNameCelula: (lote) =>
        lote.status
          ? "border-l px-2 whitespace-nowrap text-gray"
          : "border-l px-2 whitespace-nowrap text-blocked-foreground",
      renderizar: (lote) => lote.nome ?? "-",
    },
    {
      id: "diretorias_regionais",
      titulo: "DREs",
      classNameCabecalho: "border-l px-2 text-left font-bold",
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
                {diretoria.nome_curto || diretoria.nome}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      id: "status",
      titulo: "Status",
      classNameCabecalho: "border-l px-2 text-left font-bold",
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
      classNameCabecalho: "border-l px-2 text-left font-bold",
      classNameCelula: (lote) =>
        lote.status
          ? "border-l px-2 text-gray"
          : "border-l px-2 text-blocked-foreground",
      renderizar: (lote) => lote.empresa?.nome ?? "-",
    },
    {
      id: "periodo",
      titulo: "Período da\nlicitação",
      classNameCabecalho: [
        "w-[144px] min-w-[144px] max-w-[144px]",
        "whitespace-pre-line leading-4",
        "border-l px-2 py-2 text-left font-bold",
      ].join(" "),
      classNameCelula: (lote) =>
        [
          "w-[144px] min-w-[144px] max-w-[144px]",
          "border-l px-2 py-2",
          lote.status ? "text-gray" : "text-blocked-foreground",
        ].join(" "),
      renderizar: renderizarPeriodo,
    },
    {
      id: "acoes",
      tituloAcessivel: "Ações",
      classNameCabecalho: "border-l px-2 text-left font-bold",
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
