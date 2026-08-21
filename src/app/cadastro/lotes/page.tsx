import { CadastroBreadcrumb } from "@/app/cadastro/CadastroBreadcrumb";
import { ListarLotes } from "@/features/lotes/components/ListarLotes";

export default function LotesPage() {
  return (
    <>
      <CadastroBreadcrumb />
      <ListarLotes />
    </>
  );
}
