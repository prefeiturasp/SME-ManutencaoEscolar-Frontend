import { CadastroBreadcrumb } from "@/app/(cadastro)/CadastroBreadcrumb";
import { ListarCargo } from "@/features/cargo/components/ListarCargo";

export default function CargosPage() {
  return (
    <>
      <CadastroBreadcrumb />
      <ListarCargo />
    </>
  );
}
