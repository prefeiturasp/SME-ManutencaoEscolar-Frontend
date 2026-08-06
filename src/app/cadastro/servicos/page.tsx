import { CadastroBreadcrumb } from "@/app/cadastro/CadastroBreadcrumb";
import { ListarServico } from "@/features/servico/components/Servico/ListarServico";

export default function ServicosPage() {
  return (
    <>
      <CadastroBreadcrumb />
      <ListarServico />
    </>
  );
}
