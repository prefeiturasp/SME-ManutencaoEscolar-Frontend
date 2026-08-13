"use client";

import { Wrench } from "lucide-react";
import { useParams } from "next/navigation";

import { CadastroBreadcrumb } from "@/app/cadastro/CadastroBreadcrumb";
import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { EditarServicoForm } from "@/features/servico/components/Servico/EditarServicoForm";
import { useBuscarServicoPorUuid } from "@/features/servico/hooks/useListarServico";

export default function EditarServicoPage() {
  const { uuid } = useParams<{ uuid: string }>();

  const { data: servico, isLoading, isError } = useBuscarServicoPorUuid(uuid);

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

      {!isLoading && (isError || !servico) && (
        <div className="mt-34">
          <ListaVazio
            titulo="Não encontramos esta página"
            descricao={
              "A página que você procura não está disponível ou o endereço pode estar incorreto.\nVolte para a tela anterior para continuar."
            }
            textoBotao="Cadastro de serviços"
            href="/cadastro/servicos"
            primary
            icone={Wrench}
          />
        </div>
      )}

      {!isLoading && servico && (
        <EditarServicoForm uuid={uuid} servico={servico} />
      )}
    </>
  );
}
