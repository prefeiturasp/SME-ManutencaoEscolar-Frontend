"use client";

import { Download, Paperclip, Trash2, Upload } from "lucide-react";
import { useRef } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ProfissionalSchema } from "@/features/profissional/schemas/profissional.schema";
import { baixarArquivo } from "@/utils/arquivo";

interface DocumentoFuncaoFieldProps {
  readonly indiceFuncao: number;
  readonly indiceDocumento: number;
  readonly label: string;
}

export function DocumentoFuncaoField({
  indiceFuncao,
  indiceDocumento,
  label,
}: DocumentoFuncaoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { control, clearErrors, setValue } = useFormContext<ProfissionalSchema>();
  const nomeCampo = `funcoes.${indiceFuncao}.documentos.${indiceDocumento}.arquivo` as const;
  const documentoAtual = useWatch({
    control,
    name: `funcoes.${indiceFuncao}.documentos.${indiceDocumento}` as const,
  });

  return (
    <div className="flex min-h-48 flex-col gap-4 rounded-md border p-5">
      <Label htmlFor={nomeCampo} className="font-semibold">
        {label}
      </Label>
      <p className="text-sm text-gray">Selecione o arquivo obrigatório deste cargo.</p>

      <Controller
        control={control}
        name={nomeCampo}
        render={({ field }) => {
          const arquivos = field.value ?? [];
          const arquivoSelecionado = arquivos[0];
          const nomeAtual = documentoAtual?.nome_original ?? "Documento atual";
          const urlAtual = documentoAtual?.uuid ? documentoAtual.arquivo_url : undefined;
          const temArquivoAtual = Boolean(urlAtual);
          const nomeExibido = arquivoSelecionado?.name ?? (temArquivoAtual ? nomeAtual : undefined);

          return (
            <div className="flex flex-1 flex-col gap-6">
              {nomeExibido ? (
                <div className="flex min-w-0 items-center gap-2 rounded-md bg-[#E8F0FF] p-2 text-sm text-gray">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded bg-white text-primary">
                    <Paperclip className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate" title={nomeExibido}>
                    {nomeExibido}
                  </span>
                  {!arquivoSelecionado && urlAtual && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={urlAtual}
                          download={nomeAtual}
                          onClick={(event) => {
                            event.preventDefault();
                            void baixarArquivo({ nome: nomeAtual, url: urlAtual });
                          }}
                          aria-label={`Baixar arquivo ${nomeAtual}`}
                          className="flex size-7 shrink-0 items-center justify-center rounded text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          <Download className="size-5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Baixar arquivo</TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="flex size-7 shrink-0 items-center justify-center rounded text-trash-color hover:bg-destructive/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive"
                        aria-label={`Remover arquivo ${nomeExibido}`}
                        onClick={() => {
                          if (arquivoSelecionado) field.onChange([]);
                          else {
                            setValue(
                              `funcoes.${indiceFuncao}.documentos.${indiceDocumento}`,
                              { arquivo: [] },
                              { shouldDirty: true, shouldValidate: true },
                            );
                          }
                        }}
                      >
                        <Trash2 className="size-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir arquivo</TooltipContent>
                  </Tooltip>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-1 py-2 text-sm text-muted-foreground">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded bg-blocked">
                    <Paperclip className="size-4 text-blocked-foreground" aria-hidden="true" />
                  </span>
                  <span className="text-[#BFBFC2]">Selecione um arquivo</span>
                </div>
              )}

              <input
                ref={inputRef}
                id={nomeCampo}
                type="file"
                accept=".pdf,.png,.jpeg,.jpg"
                className="hidden"
                onChange={(event) => {
                  const arquivo = event.target.files?.[0];
                  if (!arquivo) return;
                  field.onChange([arquivo]);
                  clearErrors(nomeCampo);
                  event.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                className="mt-auto max-w-full rounded-md"
              >
                <Upload className="size-4" />
                {nomeExibido ? "Substituir arquivo" : "Escolher arquivo"}
              </Button>
            </div>
          );
        }}
      />
    </div>
  );
}
