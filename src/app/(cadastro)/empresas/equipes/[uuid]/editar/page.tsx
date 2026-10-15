"use client";

import { Wrench } from "lucide-react";
import { useParams } from "next/navigation";

import { CadastroBreadcrumb } from "@/app/(cadastro)/CadastroBreadcrumb";
import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { EditarEquipeForm } from "@/features/equipe/components/form/EditarEquipeForm";
import { useEquipe } from "@/features/equipe/hooks/useEquipes";

export default function EditarEquipePage() {
  const { uuid } = useParams<{ uuid: string }>();

  const { data: equipe, isLoading, isError } = useEquipe(uuid);

  return (
    <>
      <CadastroBreadcrumb />

      {isLoading && (
        <div className="flex min-h-[400px] items-center justify-center">
          <LoadingGlobal
            exibir
            titulo="Aguarde um momento!"
            mensagem="Estamos carregando as informações..."
          />
        </div>
      )}

      {!isLoading && (isError || !equipe) && (
        <div className="mt-34">
          <ListaVazio
            titulo="Não encontramos esta página"
            descricao={
              "A página que você procura não está disponível ou o endereço pode estar incorreto.\nVolte para a tela anterior para continuar."
            }
            textoBotao="Cadastro de Equipes"
            href="/empresas/equipes"
            primary
            icone={Wrench}
          />
        </div>
      )}

      {!isLoading && !isError && equipe && <EditarEquipeForm uuid={uuid} equipe={equipe} />}
    </>
  );
}
