import type { ResponsavelTecnicoSchemaOutput } from "@/features/empresa/schemas/responsavelTecnico.schema";
import type { TIPO_RESPONSAVEL_TECNICO_VALUES } from "@/features/empresa/constants/empresa.constants";

export type ResponsavelTecnicoFormValues = Omit<
  ResponsavelTecnicoSchemaOutput,
  "anexos"
>;

export type ResponsavelTecnico = {
  uuid: string;
  tipo: (typeof TIPO_RESPONSAVEL_TECNICO_VALUES)[number];
  nome: string;
  email: string;
  telefone: string;
  numero_crea?: string;
  numero_art?: string;
  criado_por: string;
  criado_em: string;
  atualizado_por: string;
  atualizado_em: string;
};
