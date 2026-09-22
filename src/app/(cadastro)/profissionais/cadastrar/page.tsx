import { ProfissionalForm } from "@/features/profissional/components/form/ProfissionalForm";
import { CadastroBreadcrumb } from "@/app/(cadastro)/CadastroBreadcrumb";

export default function CadastrarProfissionalPage() {
  return (
    <>
      <CadastroBreadcrumb />
      <ProfissionalForm />
    </>
  );
}
