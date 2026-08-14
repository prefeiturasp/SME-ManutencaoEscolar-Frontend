import { DomainBreadcrumb } from "@/components/navigation/Breadcrumb/DomainBreadcrumb";

const DOMINIOS_CADASTRO = {
  servicos: {
    rotuloPlural: "Serviços",
    rotuloSingular: "Serviço",
    editar: "Editar serviço",
  },
  empresas: {
    rotuloPlural: "Empresas",
    rotuloSingular: "Empresa",
  },
};

export function CadastroBreadcrumb() {
  return (
    <DomainBreadcrumb
      basePath="/cadastro"
      baseLabel="Cadastro"
      domains={DOMINIOS_CADASTRO}
      className="mb-8 mt-1 text-xs"
    />
  );
}
