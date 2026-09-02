"use client"; 

import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useUnidadeEducacional } from "../../hooks/useUnidadeEducacional";
import { UnidadeEducacional } from "../../types/unidadesEducacionais.types";
import { InformacoesGeraisUnidadeEducacional } from "./InformacoesGeraisUnidadeEducacional";
import { UnidadeEducacionalStepper } from "./StepperUnidadeEducacional";

export function UnidadeEducacionalForm({ uuid }: { readonly uuid?: string }) {
    const router = useRouter();
    const [etapa, setEtapa] = useState(0);
    const modoEdicao = Boolean(uuid);
    const uuidSeguro = uuid ?? "";

    const {
    data: unidadeEducacional,
    isLoading: carregandoUnidadeEducacional,
    isError,
    } = useUnidadeEducacional(uuidSeguro);

    console.log(isError)

    const form = useForm<UnidadeEducacional>();
    const botaoDesabilitado = true;
    const ultimaEtapa = etapa === 2;
    let textoBotaoPrincipal = "Próximo";
    if (ultimaEtapa) {
        textoBotaoPrincipal = modoEdicao
        ? "Salvar alterações"
        : "";
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

    useEffect(() => {
      if (unidadeEducacional) {
        form.reset(unidadeEducacional);
      }
    }, [unidadeEducacional]);

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
                    {modoEdicao ? "Unidade Educacional" : ""}
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
                 <UnidadeEducacionalStepper
                  currentStep={etapa}
                  campos_preenchidos={[true, false]}
                /> 

                {etapa === 0 && (
                  <Card className="p-6">
                    <CardContent className="p-0"> 
                      <InformacoesGeraisUnidadeEducacional />
                    </CardContent>
                  </Card>
                )}
              </div>
            </FormProvider>
          )}
        </>
      );

}