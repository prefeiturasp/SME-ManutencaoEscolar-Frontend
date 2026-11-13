import { ErrorCircleIcon } from "@/components/icons/Close";
import { PencilIcon } from "@/components/icons/PincelCustom";
import { SuccessCircleIcon } from "@/components/icons/SimboloAprovado";
import type { ColunaTabela } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";
import { Button } from "@/components/ui/button";

import type {
  CriarColunasServicoParams,
  Servico,
} from "../../types/servicos.types";

export function criarColunasServico({
  onEditar,
}: CriarColunasServicoParams): ColunaTabela<Servico>[] {
  return [
    {
      id: "nome",
      titulo: "Serviço",
      classNameCabecalho: "text-left font-bold",
      classNameCelula: (servico) =>
        servico.status ? "text-[var(--gray)]" : "text-blocked-foreground",
      renderizar: (servico) => servico.nome,
    },
    {
      id: "status",
      titulo: "Status",
      classNameCabecalho: "w-23.5 border-l text-left font-bold",
      classNameCelula: (servico) =>
        servico.status
          ? "border-l px-2 text-[var(--gray)]"
          : "border-l px-2 text-blocked-foreground",
      renderizar: (servico) => (
        <div className="flex items-center gap-1">
          {servico.status ? (
            <SuccessCircleIcon className="size-4 text-[#8DC773]" />
          ) : (
            <ErrorCircleIcon className="size-4 text-[#FD756D]" />
          )}

          {servico.status ? "Ativo" : "Inativo"}
        </div>
      ),
    },
    {
      id: "acoes",
      tituloAcessivel: "Ações",
      classNameCabecalho: "w-12 min-w-12 max-w-12 border-l px-1",
      classNameCelula: "w-12 min-w-12 max-w-12 border-l px-1 py-2 text-center",
      renderizar: (servico) => (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Editar ${servico.nome}`}
          className="size-9 border border-[var(--color-primary-dark)]"
          onClick={() => {
            onEditar(servico);
          }}
        >
          <PencilIcon className="size-4" />
        </Button>
      ),
    },
  ];
}
