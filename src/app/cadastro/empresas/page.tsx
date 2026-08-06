import { CadastroBreadcrumb } from "@/app/cadastro/CadastroBreadcrumb";
import { FornecedorLista } from "@/features/fornecedor/components/list/FornecedorLista";

export default function EmpresasPage() {
  return (
    <>
      <CadastroBreadcrumb />
      <FornecedorLista />
    </>
  );
}
