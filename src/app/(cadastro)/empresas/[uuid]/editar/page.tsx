import { EmpresaForm } from "@/features/empresa/components/form/EmpresaForm";
import { CadastroBreadcrumb } from "@/app/(cadastro)/CadastroBreadcrumb";

interface EditarEmpresaPageProps {
  readonly params: Promise<{ readonly uuid: string }>;
}

export default async function EditarEmpresaPage({
  params,
}: Readonly<EditarEmpresaPageProps>) {
  const { uuid } = await params;

  return (
    <>
      <CadastroBreadcrumb />
      <EmpresaForm uuid={uuid} />
    </>
  );
}
