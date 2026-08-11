import { CadastroBreadcrumb } from "@/app/cadastro/CadastroBreadcrumb";
import { EmpresaLista } from "@/features/empresa/components/list/EmpresaLista";

export default function EmpresasPage() {
  return (
    <>
      <CadastroBreadcrumb />
      <EmpresaLista />
    </>
  );
}
