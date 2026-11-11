"use client";

import { useEffect, useMemo, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Eye, Trash2, Upload } from "lucide-react";

import { FormError } from "@/components/form/FormError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EmpresaSchema } from "@/features/empresa/schemas/empresa.schema";

type LogoValor = File | string | null | undefined;

function nomeDaLogo(logo: Exclude<LogoValor, null | undefined>): string {
  if (logo instanceof File) return logo.name;

  try {
    const ultimoSegmento = new URL(logo).pathname.split("/").pop();
    return decodeURIComponent(ultimoSegmento || "logo");
  } catch {
    return "logo";
  }
}

export function LogoEmpresaField() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { control, setValue, trigger, getFieldState, formState } = useFormContext<EmpresaSchema>();
  const erro = getFieldState("logo", formState).error?.message;

  return (
    <div className="col-span-2 space-y-3 rounded-md border p-5">
      <Label htmlFor="logo">Logo da empresa</Label>

      <Controller
        control={control}
        name="logo"
        render={({ field }) => (
          <LogoEmpresaConteudo
            logo={field.value as LogoValor}
            erro={erro}
            inputRef={inputRef}
            onSelecionar={(arquivo) => {
              setValue("logo", arquivo, { shouldDirty: true });
              void trigger("logo");
            }}
            onRemover={() => {
              setValue("logo", null, { shouldDirty: true });
              void trigger("logo");
            }}
          />
        )}
      />
    </div>
  );
}

interface LogoEmpresaConteudoProps {
  readonly logo: LogoValor;
  readonly erro?: string;
  readonly inputRef: React.RefObject<HTMLInputElement | null>;
  readonly onSelecionar: (arquivo: File) => void;
  readonly onRemover: () => void;
}

function LogoEmpresaConteudo({
  logo,
  erro,
  inputRef,
  onSelecionar,
  onRemover,
}: LogoEmpresaConteudoProps) {
  const previaUrl = useMemo(
    () => (logo instanceof File ? URL.createObjectURL(logo) : (logo ?? null)),
    [logo],
  );

  useEffect(() => {
    if (!(logo instanceof File) || !previaUrl) return;
    return () => URL.revokeObjectURL(previaUrl);
  }, [logo, previaUrl]);

  const nome = logo ? nomeDaLogo(logo) : "";

  return (
    <>
      <div className="flex">
        <Input
          id="logo"
          readOnly
          placeholder="Nenhuma imagem selecionada"
          value={logo instanceof File ? logo.name : ""}
          aria-invalid={Boolean(erro)}
          onClick={() => inputRef.current?.click()}
          className="flex-1 cursor-pointer rounded-r-none"
        />

        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          className="hidden"
          data-testid="logo-input"
          onChange={(event) => {
            const arquivo = event.target.files?.[0];
            if (!arquivo) return;
            onSelecionar(arquivo);
            event.target.value = "";
          }}
        />

        <Button
          type="button"
          variant="outline"
          className="rounded-l-none rounded-r-md"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Escolher imagem
        </Button>
      </div>

      {erro ? (
        <FormError message={erro} />
      ) : (
        <p className="text-xs text-muted-foreground">Formatos suportados: png, jpeg e jpg.</p>
      )}

      {logo && previaUrl && !erro && (
        <div className="flex items-center gap-3 rounded-md bg-[#E8F0FF] p-2 text-sm text-gray">
          <img
            src={previaUrl}
            alt={`Prévia da logo ${nome}`}
            className="size-8 shrink-0 rounded bg-white object-contain"
          />
          <span className="min-w-0 flex-1 truncate font-semibold" title={nome}>
            {nome}
          </span>
          <button
            type="button"
            className="flex size-7 shrink-0 items-center justify-center rounded text-primary hover:bg-primary/10"
            aria-label={`Visualizar logo ${nome}`}
            onClick={() => window.open(previaUrl, "_blank", "noopener,noreferrer")}
          >
            <Eye className="size-5" />
          </button>
          <button
            type="button"
            className="flex size-7 shrink-0 items-center justify-center rounded text-trash-color hover:bg-destructive/10"
            aria-label={`Remover logo ${nome}`}
            onClick={onRemover}
          >
            <Trash2 className="size-5" />
          </button>
        </div>
      )}
    </>
  );
}
