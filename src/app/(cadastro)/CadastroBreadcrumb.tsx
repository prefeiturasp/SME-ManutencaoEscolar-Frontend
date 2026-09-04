import { DomainBreadcrumb } from "@/components/navigation/Breadcrumb/DomainBreadcrumb";

const DOMINIOS_CADASTRO = {
  servicos: {
    rotuloPlural: "Serviços",
    rotuloSingular: "Serviço",
  },
  empresas: {
    rotuloPlural: "Empresas",
    rotuloSingular: "Empresa",
  },
  Lotes: {
    rotuloPlural: "Lotes",
    rotuloSingular: "Lote",
  },
  unidadesEducacionais: {
    rotuloPlural: "Unidades Educacionais",
    rotuloSingular: "Unidade Educacional",
  },
};

export function CadastroBreadcrumb() {
  return (
    <DomainBreadcrumb
      basePath="/"
      baseLabel="Cadastro"
      domains={DOMINIOS_CADASTRO}
      className="mb-8 mt-1 text-xs"
    />
  );
}
