import { CadastroBreadcrumb } from "@/app/(cadastro)/CadastroBreadcrumb";
import { CadastrarEquipeForm } from "@/features/equipe/components/form/CadastrarEquipeForm";

export default function CadastrarEquipePage() {
  return (
    <>
      <CadastroBreadcrumb />
      <CadastrarEquipeForm />
    </>
  );
}
