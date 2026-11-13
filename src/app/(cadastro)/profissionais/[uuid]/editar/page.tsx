import { ProfissionalForm } from "@/features/profissional/components/form/ProfissionalForm";
import { CadastroBreadcrumb } from "@/app/(cadastro)/CadastroBreadcrumb";

interface EditarProfissionalPageProps {
  readonly params: Promise<{ readonly uuid: string }>;
}

export default async function EditarProfissionalPage({
  params,
}: Readonly<EditarProfissionalPageProps>) {
  const { uuid } = await params;

  return (
    <>
      <CadastroBreadcrumb />
      <ProfissionalForm uuid={uuid} />
    </>
  );
}
