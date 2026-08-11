import { ErrorCircleIcon } from "@/components/icons/Close";
import { PencilIcon } from "@/components/icons/PincelCustom";
import { SuccessCircleIcon } from "@/components/icons/SimboloAprovado";
import type {
  CriarColunasEmpresaParams,
  Empresa,
} from "../../types/empresa.types";
import { Button } from "@/components/ui/button";
import { ColunaTabela } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";
import { maskCnpj } from "@/utils/formatadores";

export function criarColunasEmpresa({
  onEditar,
}: CriarColunasEmpresaParams): ColunaTabela<Empresa>[] {
  return [
    {
      id: "razao_social",
      titulo: "Razão Social",
      classNameCabecalho: "w-full text-left font-bold text-gray",
      classNameCelula: (empresa) =>
        empresa.status ? "text-gray" : "text-blocked-foreground",
      renderizar: (empresa) => empresa.razao_social,
    },
    {
      id: "cnpj",
      titulo: "CNPJ",
      classNameCabecalho:
        "border-l text-left font-bold whitespace-nowrap text-gray",
      classNameCelula: (empresa) =>
        empresa.status
          ? "border-l px-2 whitespace-nowrap text-gray"
          : "border-l px-2 whitespace-nowrap text-blocked-foreground",
      renderizar: (empresa) => maskCnpj(empresa.cnpj),
    },
    {
      id: "status",
      titulo: "Status",
      classNameCabecalho: "w-23.5 border-l text-left font-bold text-gray",
      classNameCelula: (empresa) =>
        empresa.status
          ? "border-l px-2 text-gray"
          : "border-l px-2 text-blocked-foreground",
      renderizar: (empresa) => (
        <div className="flex items-center gap-1">
          {empresa.status ? (
            <SuccessCircleIcon className="size-4 text-[#8DC773]" />
          ) : (
            <ErrorCircleIcon className="size-4 text-[#FD756D]" />
          )}

          {empresa.status ? "Ativo" : "Inativo"}
        </div>
      ),
    },
    {
      id: "rastreio",
      titulo: "Rastreio",
      classNameCabecalho: "border-l text-left font-bold text-gray",
      classNameCelula: "border-l px-2",
      renderizar: (empresa) =>
        empresa.status && empresa.link_rastreio ? (
          <a
            href={empresa.link_rastreio}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-secondary underline underline-offset-2 whitespace-nowrap"
          >
            Rastrear empresa
          </a>
        ) : (
          <span className="font-medium text-blocked-foreground underline underline-offset-2 whitespace-nowrap">
            Rastrear empresa
          </span>
        ),
    },
    {
      id: "acoes",
      tituloAcessivel: "Ações",
      classNameCabecalho: "w-16 border-l",
      classNameCelula: "border-l px-2 py-2 text-center",
      renderizar: (empresa) => (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Editar ${empresa.razao_social}`}
          className="border border-primary-dark"
          onClick={() => {
            onEditar(empresa);
          }}
        >
          <PencilIcon className="size-4" />
        </Button>
      ),
    },
  ];
}
