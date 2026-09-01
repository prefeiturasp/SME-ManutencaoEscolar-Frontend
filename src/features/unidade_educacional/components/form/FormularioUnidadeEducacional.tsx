"use client"; 

import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatarDataHora } from "@/utils/formatadores";
import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

export function UnidadeEducacionalForm({ uuid }: { readonly uuid?: string }) {
    const router = useRouter();
    const [etapa, setEtapa] = useState(0);
    const modoEdicao = Boolean(uuid);
    const uuidSeguro = uuid ?? "";

    const {
    data: unidadeEducacional,
    isLoading: carregandoUnidadeEducacional,
    isError,
    } = {};

    const form = useForm();
    const botaoDesabilitado = true;
    const ultimaEtapa = etapa === 2;
    let textoBotaoPrincipal = "Próximo";
    if (ultimaEtapa) {
        textoBotaoPrincipal = modoEdicao
        ? "Salvar alterações"
        : "Cadastrar empresa";
    }

    function handlePrevious() {
        if (etapa === 0) {
        router.push("/unidades-educacionais");
            return;
        }
        setEtapa((atual) => atual - 1);
    }
    async function handleNext() {
        if (ultimaEtapa) {
            return;
        }
    }

    return (
        <>
          {modoEdicao && (isError || !unidadeEducacional) && !carregandoUnidadeEducacional && (
            <div className="flex min-h-[70vh] items-center justify-center">
              <ListaVazio
                titulo="Esta informação não está mais disponível!"
                descricao={
                  "Este item não existe ou foi excluído por outro usuário e não pode mais ser editado.\nAtualize a página para exibir as informações mais recentes."
                }
                textoBotao="Atualizar página"
                href="/empresas"
                primary
                icone={RotateCw}
              />
            </div>
          )}
          {modoEdicao && carregandoUnidadeEducacional && <LoadingGlobal exibir />}
          {!isError && !carregandoUnidadeEducacional && (
            <FormProvider {...form}>
              <div className="mx-auto w-full">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-semibold">
                    {modoEdicao ? "Edição de empresa" : ""}
                  </h1>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/empresas")}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant={etapa === 0 ? "blocked" : "outline"}
                      onClick={handlePrevious}
                      disabled={etapa === 0}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant={botaoDesabilitado ? "blocked" : "default"}
                      onClick={handleNext}
                      disabled={botaoDesabilitado}
                    >
                      {textoBotaoPrincipal}
                    </Button>
                  </div>
                </div> 
                {etapa === 0 && (
                  <Card className="p-6">
                    <CardContent className="p-0">
    
                      {modoEdicao && unidadeEducacional && (
                        <div className="mt-8 flex flex-col items-start font-bold text-gray text-[12px]">
                          <p>
                            Inserido por {unidadeEducacional.criado_por ?? "Não informado"} em{" "}
                            {formatarDataHora(unidadeEducacional.criado_em)}
                          </p>
                          <p>
                            Alterado por {unidadeEducacional.atualizado_por ?? "Não informado"}{" "}
                            em {formatarDataHora(unidadeEducacional.atualizado_em)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </FormProvider>
          )}
        </>
      );

}