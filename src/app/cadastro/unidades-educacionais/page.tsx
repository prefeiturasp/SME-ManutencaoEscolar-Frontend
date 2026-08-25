import { CadastroBreadcrumb } from "@/app/cadastro/CadastroBreadcrumb";
import { UnidadeEducacionalLista } from "@/features/unidade_educacional/components/list/UnidadeEducacionalLista";

export default function UnidadesEducacionaisPage() {
  return (
    <>
      <CadastroBreadcrumb />
      <UnidadeEducacionalLista />
    </>
  );
}
