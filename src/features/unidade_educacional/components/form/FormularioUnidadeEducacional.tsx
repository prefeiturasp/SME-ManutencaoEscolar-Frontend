"use client"; 

import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { Stepper } from "@/components/shared/Stepper/Stepper";
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
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { InformacoesGeraisUnidadeEducacional } from "./InformacoesGeraisUnidadeEducacional";

const TOTAL_ETAPAS = 2;

const CAMPOS_ETAPA_INFORMACOES_GERAIS = [
  "codigo_eol",
  "tipo_escola",
  "diretoria_regional",
  "nome",
  "subprefeitura",
  "lote",
  "status",
  "telefone",
  "email",
  "cep",
  "logradouro",
  "numero",
  "bairro",
  "cidade",
  "estado",
] as const satisfies readonly (keyof UnidadeEducacionalSchema)[];

const CAMPOS_ETAPA_CONTATOS_RESPONSAVEIS = [] as const satisfies readonly (
  keyof UnidadeEducacionalSchema
)[];

export const UNIDADE_EDUCACIONAL_ETAPAS = [
  { key: "informacoes-gerais", label: "Informações gerais" },
  { key: "contatos", label: "Contatos" },
] as const;

export function camposEstaoPreenchidos(
      valores: Partial<UnidadeEducacionalSchema>,
      campos: readonly (keyof UnidadeEducacionalSchema)[],
    ): boolean {
      if (campos.length === 0) {
        return false;
      }

      return campos.every((campo) => {
        const valor = valores[campo];

        return String(valor ?? "").trim() !== "";
      });
    }

export function UnidadeEducacionalForm({ uuid }: { readonly uuid: string }) {
    const router = useRouter();
    const [etapa, setEtapa] = useState(0);
    const ultimaEtapa = etapa === TOTAL_ETAPAS - 1;

    const defaultValues: UnidadeEducacionalSchema = {
      ...Object.fromEntries(CAMPOS_ETAPA_INFORMACOES_GERAIS.map((campo) => [campo, ""])),
      status: "true",
    } as UnidadeEducacionalSchema;


    const {
      data: unidadeEducacional,
      isLoading: carregandoUnidadeEducacional,
      isError,
    } = useUnidadeEducacional(uuid);
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
    
    
    const textoBotaoPrincipal = ultimaEtapa ? "Salvar alterações" : "Próximo";

    const valoresFormulario = useWatch({
        control: form.control,
    });

    const camposPreenchidos = [
    camposEstaoPreenchidos(
      valoresFormulario,
      CAMPOS_ETAPA_INFORMACOES_GERAIS,
    ),
    camposEstaoPreenchidos(
      valoresFormulario,
      CAMPOS_ETAPA_CONTATOS_RESPONSAVEIS,
    ),
  ] as const;

    function handlePrevious() {
        setEtapa((atual) => atual - 1);
    }

    async function handleNext() {
        if (ultimaEtapa) {
          // será implementada na proxima etapa
            return;
        }

        const etapaValida = await form.trigger(
          CAMPOS_ETAPA_INFORMACOES_GERAIS,
        );

        if (!etapaValida) {
          return;
        }

      setEtapa((atual) =>
        Math.min(atual + 1, TOTAL_ETAPAS - 1),
      );
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

    if (carregandoUnidadeEducacional){
      return <LoadingGlobal exibir />;
    }
    if (isError || !unidadeEducacional) {
      return(
        <div className="flex min-h-[70vh] items-center justify-center">
          <ListaVazio
            titulo="Esta informação não está mais disponível!"
            descricao={
              "Este item não existe ou foi excluído por outro usuário e não pode mais ser editado.\nAtualize a página para exibir as informações mais recentes."
            }
            textoBotao="Atualizar página"
            href="/unidades-educacionais"
            primary
            icone={RotateCw}
          />
        </div>
      )
    }
    return (
      <FormProvider {...form}>
        <div className="mx-auto w-full">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">
              Unidade Educacional
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
            <Stepper
              steps={UNIDADE_EDUCACIONAL_ETAPAS}
              currentStep={etapa}
              camposPreenchidos={camposPreenchidos}
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
          {etapa === 1 && (
          <Card className="p-6">
            <CardContent className="p-0">
              <div
                data-testid="etapa-contatos-responsaveis"
                className="py-8 text-center text-muted-foreground"
              >
                
              </div>
            </CardContent>
          </Card>
        )}

        </div>
      </FormProvider>
    )

}