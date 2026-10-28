export type VinculoErro = readonly [dre: string, lote: string];

export type AlertaErroVinculoLoteProps = Readonly<{
  aberto: boolean;
  titulo: string;
  mensagem: string;
  vinculados: readonly VinculoErro[];
  equipes?: EquipeVinculadaLote[];
  width?: number;
  onOpenChange: (aberto: boolean) => void;
}>;
import type { EquipeVinculadaLote } from "@/features/lotes/types/lotes.types";
