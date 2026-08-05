import { ErrorCircleIcon } from "@/components/icons/Close";
import { PencilIcon } from "@/components/icons/PincelCustom";
import { SuccessCircleIcon } from "@/components/icons/SimboloAprovado";
import type { CriarColunasFornecedorParams } from "../../types/fornecedor.types";
import { Button } from "@/components/ui/button";
import { Fornecedor } from "../../types/fornecedor.types";
import { ColunaTabela } from "@/components/shared/types/TabelaDeDados.type";
import { maskCnpj } from "@/utils/formatadores";

export function criarColunasFornecedor({
  onEditar,
}: CriarColunasFornecedorParams): ColunaTabela<Fornecedor>[] {
  return [
    {
      id: "razao_social",
      titulo: "Razão Social",
      classNameCabecalho: "w-full text-left font-bold text-gray",
      classNameCelula: (fornecedor) =>
        fornecedor.status ? "text-gray" : "text-blocked-foreground",
      renderizar: (fornecedor) => fornecedor.razao_social,
    },
    {
      id: "cnpj",
      titulo: "CNPJ",
      classNameCabecalho:
        "border-l text-left font-bold whitespace-nowrap text-gray",
      classNameCelula: (fornecedor) =>
        fornecedor.status
          ? "border-l px-2 whitespace-nowrap text-gray"
          : "border-l px-2 whitespace-nowrap text-blocked-foreground",
      renderizar: (fornecedor) => maskCnpj(fornecedor.cnpj),
    },
    {
      id: "status",
      titulo: "Status",
      classNameCabecalho: "w-23.5 border-l text-left font-bold text-gray",
      classNameCelula: (fornecedor) =>
        fornecedor.status
          ? "border-l px-2 text-gray"
          : "border-l px-2 text-blocked-foreground",
      renderizar: (fornecedor) => (
        <div className="flex items-center gap-1">
          {fornecedor.status ? (
            <SuccessCircleIcon className="size-4 text-[#8DC773]" />
          ) : (
            <ErrorCircleIcon className="size-4 text-[#FD756D]" />
          )}

          {fornecedor.status ? "Ativo" : "Inativo"}
        </div>
      ),
    },
    {
      id: "rastreio",
      titulo: "Rastreio",
      classNameCabecalho: "border-l text-left font-bold text-gray",
      classNameCelula: "border-l px-2",
      renderizar: (fornecedor) =>
        fornecedor.status && fornecedor.link_rastreio ? (
          <a
            href={fornecedor.link_rastreio}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-secondary underline underline-offset-2 whitespace-nowrap"
          >
            Rastrear fornecedor
          </a>
        ) : (
          <span className="font-medium text-blocked-foreground underline underline-offset-2 whitespace-nowrap">
            Rastrear fornecedor
          </span>
        ),
    },
    {
      id: "acoes",
      tituloAcessivel: "Ações",
      classNameCabecalho: "w-16 border-l",
      classNameCelula: "border-l px-2 py-2 text-center",
      renderizar: (fornecedor) => (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Editar ${fornecedor.razao_social}`}
          className="border border-primary-dark"
          onClick={() => {
            onEditar(fornecedor);
          }}
        >
          <PencilIcon className="size-4" />
        </Button>
      ),
    },
  ];
}
