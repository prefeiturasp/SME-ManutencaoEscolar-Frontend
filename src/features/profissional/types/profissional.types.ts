import type { ProfissionalSchemaOutput } from "../schemas/profissional.schema";

export type ProfissionalFormValues = ProfissionalSchemaOutput;
export type Profissional = ProfissionalFormValues & { id: number; uuid: string; criado_em: string; atualizado_em: string };
export type ProfissionalResultado =
  | { success: true; profissional: Profissional }
  | {
      success: false;
      error: "api-error";
      title: string;
      message: string;
      status?: number;
      fieldErrors?: { cpf?: string; rg?: string };
    };
