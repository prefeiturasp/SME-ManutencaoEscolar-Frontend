"use client"; 

import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useListarDiretoriasRegionais } from "@/features/diretoria_regional/hooks/useDiretoriaRegional";
import { useTodosSubprefeituras } from "@/features/subprefeitura/hooks/useSubprefeitura";
import { useTodosTiposUnidades } from "@/features/tipo_unidade/hooks/useTipoUnidade";
import { useUnidadeEducacional } from "@/features/unidade_educacional/hooks/useUnidadeEducacional";
import { UnidadeEducacionalOutput, UnidadeEducacionalSchema, unidadeEducacionalSchema } from "@/features/unidade_educacional/schemas/unidadesEducacionais.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { InformacoesGeraisUnidadeEducacional } from "./InformacoesGeraisUnidadeEducacional";
import { UnidadeEducacionalStepper } from "./StepperUnidadeEducacional";

export function UnidadeEducacionalForm({ uuid }: { readonly uuid?: string }) {
    const router = useRouter();
    const [etapa, setEtapa] = useState(0);
    const modoEdicao = Boolean(uuid);
    const uuidSeguro = uuid ?? "";
    const ultimaEtapa = etapa === 2;

    const defaultValues: UnidadeEducacionalSchema = {
      codigo_eol: "",
      tipo_escola: "",
      diretoria_regional: "",
      nome: "",
      subprefeitura: "",
      lote: "",
      status: "true",
      telefone: "",
      email: "",
      cep: "",
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
    };


    const {
      data: unidadeEducacional,
      isLoading: carregandoUnidadeEducacional,
      isError,
    } = useUnidadeEducacional(uuidSeguro);
    const form = useForm<UnidadeEducacionalSchema, unknown, UnidadeEducacionalOutput>({
      resolver: zodResolver(unidadeEducacionalSchema),
          defaultValues,
          mode: "onBlur",
    });


    const { data: tiposUnidades } = useTodosTiposUnidades();
    const tipoUnidadeOptions =
      tiposUnidades?.map((tipo) => ({
        value: String(tipo.uuid),
        label: String(tipo.sigla || tipo.codigo_eol),
      })) ?? [];

    const { data: diretoriasRegionais } = useListarDiretoriasRegionais();
    const diretoriaRegionalOptions =
      diretoriasRegionais?.results?.map((diretoria) => ({
        value: String(diretoria.id),
        label: diretoria.nome_curto || diretoria.abreviacao,
      })) ?? [];
        

    const { data: subprefeituras } = useTodosSubprefeituras();
    const subprefeituraOptions = [
      {
        value: "sem-subprefeitura",
        label: "Nenhuma",
      },
      ...(subprefeituras?.map((subprefeitura) => ({
        value: String(subprefeitura.uuid),
        label: subprefeitura.nome || subprefeitura.codigo_eol,
      })) ?? []),
    ];
    
    
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
      if (!unidadeEducacional) {
        return;
      }

      form.reset({
        codigo_eol: unidadeEducacional.codigo_eol ?? "",
        tipo_escola: unidadeEducacional.tipo_escola?.uuid ?? "",
        diretoria_regional: String(
          unidadeEducacional.diretoria_regional?.id ?? "",
        ),
        nome: unidadeEducacional.nome ?? "",
        subprefeitura: unidadeEducacional.subprefeitura?.uuid ?? "sem-subprefeitura",
        lote: unidadeEducacional.lote?.nome ?? "",
        status: unidadeEducacional.status ? "true" : "false",
        telefone: unidadeEducacional.dados?.telefone ?? "",
        email: unidadeEducacional.dados?.email ?? "",
        cep: unidadeEducacional.dados?.cep ?? "",
        logradouro: unidadeEducacional.dados?.logradouro ?? "",
        numero: unidadeEducacional.dados?.numero ?? "",
        bairro: unidadeEducacional.dados?.bairro ?? "",
        cidade: unidadeEducacional.dados?.municipio ?? "",
        estado: unidadeEducacional.dados?.uf ?? "",
      });

    }, [unidadeEducacional, form]);

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
                      onClick={() => router.push("/unidades-educacionais")}
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
                      variant={"default"}
                      onClick={handleNext}
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
                      <InformacoesGeraisUnidadeEducacional
                        tiposUnidades={tipoUnidadeOptions}
                        diretoriasRegionais={diretoriaRegionalOptions}
                        subprefeituras={subprefeituraOptions}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </FormProvider>
          )}
        </>
      );

}