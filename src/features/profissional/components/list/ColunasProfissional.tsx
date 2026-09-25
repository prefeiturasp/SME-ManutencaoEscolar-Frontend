import { ErrorCircleIcon } from "@/components/icons/Close";
import { PencilIcon } from "@/components/icons/PincelCustom";
import { SuccessCircleIcon } from "@/components/icons/SimboloAprovado";
import type {
  CriarColunasProfissionalParams,
  Profissional,
} from "@/features/profissional/types/profissional.types";
import { Button } from "@/components/ui/button";
import { ColunaTabela } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";
import { maskCpf } from "@/utils/formatadores";

export function criarColunasProfissional({
  onEditar,
}: CriarColunasProfissionalParams): ColunaTabela<Profissional>[] {
  return [
    {
      id: "nome",
      titulo: "Nome do profissional",
      classNameCabecalho: "w-[21%] text-left font-bold whitespace-nowrap text-gray",
      classNameCelula: (profissional) =>
        profissional.status ? "text-gray" : "text-blocked-foreground",
      renderizar: (profissional) => profissional.nome,
    },
    {
      id: "rg",
      titulo: "Registro geral (RG)",
      classNameCabecalho: "w-[11%] border-l text-left font-bold whitespace-nowrap text-gray",
      classNameCelula: (profissional) =>
        profissional.status ? "border-l px-2 text-gray" : "border-l px-2 text-blocked-foreground",
      renderizar: (profissional) => profissional.rg,
    },
    {
      id: "cpf",
      titulo: "CPF ou CIN",
      classNameCabecalho: "w-[11%] border-l text-left font-bold text-gray",
      classNameCelula: (profissional) =>
        profissional.status
          ? "border-l px-2 text-gray whitespace-nowrap"
          : "border-l px-2 text-blocked-foreground whitespace-nowrap",
      renderizar: (profissional) => maskCpf(profissional.cpf),
    },
    {
      id: "funcoes",
      titulo: "Funções",
      classNameCabecalho: "w-[45.5%] border-l text-left font-bold text-gray",
      classNameCelula: (profissional) =>
        profissional.status ? "border-l px-2 text-gray" : "border-l px-2 text-blocked-foreground",
      renderizar: (profissional) => {
        return (
          <div className="flex flex-wrap gap-1">
            {profissional.funcoes.map((funcao, index) => (
              <span
                key={`${funcao}-${index}`}
                className="inline-flex items-center whitespace-nowrap rounded-md bg-[#EEEEEE] px-2 py-1 text-sm font-normal"
              >
                {funcao}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      id: "status",
      titulo: "Status",
      classNameCabecalho: "w-[7.5%] border-l text-left font-bold text-gray",
      classNameCelula: (profissional) =>
        profissional.status ? "border-l px-2 text-gray" : "border-l px-2 text-blocked-foreground",
      renderizar: (profissional) => (
        <div className="flex items-center gap-1">
          {profissional.status ? (
            <SuccessCircleIcon className="size-4 text-[#8DC773]" />
          ) : (
            <ErrorCircleIcon className="size-4 text-[#FD756D]" />
          )}

          {profissional.status ? "Ativo" : "Inativo"}
        </div>
      ),
    },
    {
      id: "acoes",
      tituloAcessivel: "Ações",
      classNameCabecalho: "w-[4%] border-l",
      classNameCelula: "border-l px-2 py-2 text-center",
      renderizar: (profissional) => (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Editar ${profissional.cpf}`}
          className="border border-primary-dark"
          onClick={() => {
            onEditar(profissional);
          }}
          disabled
        >
          <PencilIcon className="size-4" />
        </Button>
      ),
    },
  ];
}
