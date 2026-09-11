"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { FormSelectField, FormTextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import type { CargoFormData } from "@/features/cargo/schemas/cargoSchema";

const EXIGE_DOCUMENTO_OPCOES = [
  {
    label: "Sim",
    value: "true",
  },
  {
    label: "Não",
    value: "false",
  },
];

export function FormCargo() {
  const { control, getValues, setValue, trigger } =
    useFormContext<CargoFormData>();

  const exigeDocumento = useWatch({
    control,
    name: "exige_documento",
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "documentos",
  });

  useEffect(() => {
    if (exigeDocumento === "false") {
      replace([]);

      setValue("novo_documento", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [exigeDocumento, replace, setValue]);

  async function adicionarDocumento() {
    const nome = getValues("novo_documento")?.trim() ?? "";

    if (!nome) {
      await trigger("novo_documento");
      return;
    }

    const documentos = getValues("documentos") ?? [];

    const nomeDuplicado = documentos.some(
      (documento) =>
        documento.nome.trim().toLocaleLowerCase("pt-BR") ===
        nome.toLocaleLowerCase("pt-BR"),
    );

    if (nomeDuplicado) {
      setValue("novo_documento", nome, {
        shouldDirty: true,
        shouldValidate: true,
      });

      await trigger("novo_documento");
      return;
    }

    append(
      {
        nome,
      },
      {
        shouldFocus: false,
      },
    );

    setValue("novo_documento", "", {
      shouldDirty: true,
      shouldValidate: true,
    });

    await trigger("documentos");
  }

  async function excluirDocumento(index: number) {
    remove(index);

    await trigger(["documentos", "novo_documento"]);
  }

  async function excluirDocumentoPrincipal() {
    const documentos = getValues("documentos") ?? [];
    const documentoMaisAntigo = documentos.at(-1);

    if (!documentoMaisAntigo) {
      setValue("novo_documento", "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      return;
    }

    remove(documentos.length - 1);

    setValue("novo_documento", documentoMaisAntigo.nome, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    await trigger(["novo_documento", "documentos"]);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormTextField<CargoFormData>
          name="nome"
          label="Nome do cargo"
          placeholder="Digite o nome do cargo..."
        />

        <FormSelectField<CargoFormData>
          name="exige_documento"
          label="Exige documento?"
          placeholder="Selecione"
          options={EXIGE_DOCUMENTO_OPCOES}
        />
      </div>

      {exigeDocumento === "true" && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">Documentos exigidos</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Informe os documentos exigidos para este cargo. Se houver mais de
              um, clique em “+” para adicionar outro campo. Caso o cargo não
              exija documentos, deixe esta seção em branco.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div
              className="
                grid
                grid-cols-[minmax(0,1fr)_56px_56px]
                items-start
                gap-2
              "
            >
              <FormTextField<CargoFormData>
                name="novo_documento"
                label="Nome do documento"
                placeholder="Digite o nome do documento..."
              />

              <Button
                type="button"
                variant="outline"
                className="
                  mt-4 h-10 w-14 min-w-14 rounded-lg
                  border-[#02408B] p-0 text-[#02408B]
                  hover:bg-blue-50 hover:text-[#02408B]
                "
                aria-label="Adicionar documento"
                onClick={() => void adicionarDocumento()}
              >
                <Plus className="h-6 w-6" />
              </Button>

              <Button
                type="button"
                variant="outline"
                className="
                  mt-4 h-10 w-14 min-w-14 rounded-lg
                  border-red-600 p-0 text-red-600
                  hover:bg-red-50 hover:text-red-700
                "
                aria-label="Limpar documento"
                onClick={() => void excluirDocumentoPrincipal()}
              >
                <Trash2 className="h-6 w-6" />
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="
                  grid
                  grid-cols-[minmax(0,1fr)_56px_56px]
                  items-start
                  gap-2
                "
              >
                <div className="col-span-2 min-w-0">
                  <FormTextField<CargoFormData>
                    name={`documentos.${index}.nome`}
                    label="Nome do documento"
                    placeholder="Digite o nome do documento..."
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="
                    mt-4 h-10 w-14 min-w-14 rounded-lg
                    border-red-600 p-0 text-red-600
                    hover:bg-red-50 hover:text-red-700
                  "
                  aria-label={`Excluir documento ${index + 1}`}
                  onClick={() => void excluirDocumento(index)}
                >
                  <Trash2 className="h-6 w-6" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
