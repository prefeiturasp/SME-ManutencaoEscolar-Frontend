import type { ResponsavelTecnicoSchemaOutput } from "@/features/empresa/schemas/responsavelTecnico.schema";

export type ResponsavelTecnicoFormValues = Omit<
  ResponsavelTecnicoSchemaOutput,
  "anexos"
>;
