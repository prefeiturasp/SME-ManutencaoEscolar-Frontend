import { CadastroBreadcrumb } from "@/app/(cadastro)/CadastroBreadcrumb";
import { ProfissionalLista } from "@/features/profissional/components/list/ProfissionalLista";

export default function ProfissionaisPage() {
  return (
    <>
      <CadastroBreadcrumb />
      <ProfissionalLista />
    </>
  );
}
