import { CadastroBreadcrumb } from "@/app/(cadastro)/CadastroBreadcrumb";
import { UnidadeEducacionalForm } from "@/features/unidade_educacional/components/form/FormularioUnidadeEducacional";

interface EditarUnidadeEducacionalPageProps {
  readonly params: Promise<{ readonly uuid: string }>;
}

export default async function EditarEmpresaPage({
  params,
}: Readonly<EditarUnidadeEducacionalPageProps>) {
  const { uuid } = await params;

  return (
    <>
      <CadastroBreadcrumb />
      <UnidadeEducacionalForm uuid={uuid} />
    </>
  );
}
