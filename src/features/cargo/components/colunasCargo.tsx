import { PencilIcon } from "@/components/icons/PincelCustom";
import type { ColunaTabela } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";
import { Button } from "@/components/ui/button";

import type {
  Cargo,
  CriarColunasCargoParams,
} from "@/features/cargo/types/cargos.types";

export function criarColunasCargo({
  onEditar,
}: CriarColunasCargoParams): ColunaTabela<Cargo>[] {
  return [
    {
      id: "nome",
      titulo: "Cargo",
      classNameCabecalho: "text-left font-bold",
      classNameCelula: "text-left",
      renderizar: (cargo) => cargo.nome,
    },
    {
      id: "exige_documento",
      titulo: "Exige Documento?",
      classNameCabecalho:
        "w-[140px] min-w-[140px] max-w-[140px] border-l px-2 text-left font-bold text-[var(--gray)]",
      classNameCelula:
        "w-[140px] min-w-[140px] max-w-[140px] border-l px-2 text-left text-[var(--gray)]",
      renderizar: (cargo) => (cargo.exige_documento ? "Sim" : "Não"),
    },
    {
      id: "acoes",
      tituloAcessivel: "Ações",
      classNameCabecalho: "w-12 min-w-12 max-w-12 border-l px-1",
      classNameCelula: "w-12 min-w-12 max-w-12 border-l px-1 py-2 text-center",
      renderizar: (cargo) => (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Editar ${cargo.nome}`}
          className="size-9 border border-[var(--color-primary-dark)]"
          onClick={() => {
            onEditar(cargo);
          }}
        >
          <PencilIcon className="size-4" />
        </Button>
      ),
    },
  ];
}
