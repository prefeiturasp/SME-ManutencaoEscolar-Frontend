import type { ColunaTabela } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";
import type { Opcao } from "@/components/types/opcao.types";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SolicitacaoManutencaoResumo } from "@/features/solicitacao_manutencao/types/solicitacaoManutencao.types";
import { format, isValid, parseISO } from "date-fns";
import { Pencil, Search, Send } from "lucide-react";

function obterRotulo(valor: string, opcoes: readonly { value: string; label: string }[]) {
  return opcoes.find((opcao) => opcao.value === valor)?.label ?? (valor || "—");
}

function formatarDataEnvio(valor: string | null) {
  if (!valor) return "—";
  const data = parseISO(valor);
  return isValid(data) ? format(data, "dd/MM/yyyy") : "—";
}

export function criarColunasSolicitacaoManutencao(opcoes: {
  fases: Opcao[];
  situacoes: Opcao[];
  tipos: Opcao[];
}): ColunaTabela<SolicitacaoManutencaoResumo>[] {
  return [
    {
      id: "codigo",
      titulo: "Código da solicitação",
      classNameCabecalho: "w-[15%] text-left font-bold text-gray",
      renderizar: (solicitacao) => String(solicitacao.codigo),
    },
    {
      id: "tipo_atendimento",
      titulo: "Tipo de atendimento",
      classNameCabecalho: "w-[15%] border-l text-left font-bold text-gray",
      classNameCelula: "border-l",
      renderizar: (solicitacao) => obterRotulo(solicitacao.tipo_atendimento, opcoes.tipos),
    },
    {
      id: "data_envio",
      titulo: "Data de envio",
      classNameCabecalho: "w-[15%] border-l text-left font-bold text-gray",
      classNameCelula: "border-l",
      renderizar: (solicitacao) => formatarDataEnvio(solicitacao.data_envio),
    },
    {
      id: "fase",
      titulo: "Fase",
      classNameCabecalho: "w-[15%] border-l text-left font-bold text-gray",
      classNameCelula: "border-l",
      renderizar: (solicitacao) => obterRotulo(solicitacao.fase, opcoes.fases),
    },
    {
      id: "situacao",
      titulo: "Situação",
      classNameCabecalho: "w-[30%] border-l text-left font-bold text-gray",
      classNameCelula: "border-l",
      renderizar: (solicitacao) => obterRotulo(solicitacao.situacao, opcoes.situacoes),
    },
    {
      id: "acoes",
      tituloAcessivel: "Ações",
      classNameCabecalho: "w-[10%] border-l",
      classNameCelula: "border-l",
      renderizar: (solicitacao) => (
        <div className="flex justify-end gap-2">
          {[
            { label: "Visualizar solicitação", Icone: Search },
            { label: "Editar solicitação", Icone: Pencil },
            { label: "Enviar para DRE", Icone: Send },
          ].map(({ label, Icone }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <span
                  aria-label={`${label} ${solicitacao.codigo}: indisponível`}
                  className="inline-flex"
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled
                    aria-label={`${label} ${solicitacao.codigo}`}
                  >
                    <Icone className="size-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      ),
    },
  ];
}
