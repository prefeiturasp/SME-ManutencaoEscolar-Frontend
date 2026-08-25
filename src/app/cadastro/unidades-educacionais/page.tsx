import { CadastroBreadcrumb } from "@/app/cadastro/CadastroBreadcrumb";
import { UnidadeEducacionalLista } from "@/features/unidade_educacional/components/list/ListaUnidadeEducacional";

export default function UnidadesEducacionaisPage() {
  return (
    <>
      <CadastroBreadcrumb />
      <UnidadeEducacionalLista />
    </>
  );
}
