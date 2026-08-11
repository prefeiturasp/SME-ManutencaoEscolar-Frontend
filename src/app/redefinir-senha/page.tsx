import { RedefinirSenhaForm } from "@/features/login/components/RedefinirSenhaForm/RedefinirSenhaForm";

type PageProps = Readonly<{
  searchParams: Promise<{
    id?: string;
    token?: string;
  }>;
}>;

export default async function Page({ searchParams }: PageProps) {
  const { id, token } = await searchParams;

  return <RedefinirSenhaForm id={id ?? ""} token={token ?? ""} />;
}
