import { DomainBreadcrumb } from "@/components/navigation/Breadcrumb/DomainBreadcrumb";

const DOMINIOS_CADASTRO = {
  servicos: {
    rotuloPlural: "Serviços",
    rotuloSingular: "Serviço",
  },
  fornecedores: {
    rotuloPlural: "Fornecedores",
    rotuloSingular: "Fornecedor",
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
