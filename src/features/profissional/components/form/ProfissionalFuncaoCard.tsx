"use client";

import { CircleAlert, Trash2 } from "lucide-react";

import { FormComboboxField } from "@/components/form/FormComboboxField";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Cargo } from "@/features/cargo/types/cargos.types";
import type { ProfissionalSchema } from "@/features/profissional/schemas/profissional.schema";
import type { FuncaoProfissional } from "@/features/profissional/types/profissional.types";
import { formatarDataHora } from "@/utils/formatadores";

import { DocumentoFuncaoField } from "./DocumentoFuncaoField";

interface ProfissionalFuncaoCardProps {
  readonly index: number;
  readonly quantidadeFuncoes: number;
  readonly cargo?: Cargo;
  readonly auditoria?: FuncaoProfissional;
  readonly opcoesCargo: { readonly value: string; readonly label: string }[];
  readonly onSelecionarCargo: (cargoUuid: string) => void;
  readonly onRemover: () => void;
}

export function ProfissionalFuncaoCard({
  index,
  quantidadeFuncoes,
  cargo,
  auditoria,
  opcoesCargo,
  onSelecionarCargo,
  onRemover,
}: ProfissionalFuncaoCardProps) {
  return (
    <Card className="p-6">
      <CardContent className="space-y-4 p-0">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Selecione a função que o profissional exerce. Algumas funções exigem o anexo de
            documentos comprobatórios.
          </p>
          {quantidadeFuncoes > 1 && (
            <Button
              className="h-9 gap-2 border border-trash-color bg-transparent px-4 text-xs text-trash-color"
              type="button"
              variant="destructive"
              aria-label={`Remover função ${index + 1}`}
              onClick={onRemover}
            >
              <Trash2 className="size-4" /> Excluir
            </Button>
          )}
        </div>

        <FormComboboxField<ProfissionalSchema>
          name={`funcoes.${index}.uuid_cargo`}
          label="Função"
          placeholder="Selecione"
          searchPlaceholder="Digite o nome de uma função..."
          emptyMessage="Nenhuma função encontrada."
          options={opcoesCargo}
          onValueChange={onSelecionarCargo}
        />

        {cargo?.exige_documento && cargo.documentos.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {cargo.documentos.map((documento, documentoIndex) => (
                <DocumentoFuncaoField
                  key={`${documento.uuid ?? documento.id}-${documentoIndex}`}
                  indiceFuncao={index}
                  indiceDocumento={documentoIndex}
                  label={documento.nome}
                />
              ))}
            </div>

            <div className="flex items-center gap-3 rounded-md bg-[#F38D1C1A] px-3 py-2">
              <CircleAlert className="size-5 shrink-0 text-secondary" />
              <p className="text-sm text-gray-500">
                Anexe os documentos obrigatórios deste cargo. Cada arquivo deve corresponder ao
                documento definido no cadastro do cargo.
              </p>
            </div>
          </div>
        )}

        {auditoria?.criado_em && (
          <p className="w-fit rounded-md bg-blue-50 px-2 py-1 text-[12px] text-gray-600">
            Função inserida por {auditoria.criado_por ?? "Não informado"}
            {auditoria.registro_funcional ? ` - RF N° ${auditoria.registro_funcional}` : ""} em{" "}
            {formatarDataHora(auditoria.criado_em)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
