export type VinculoErro = readonly [dre: string, lote: string];

export type AlertaErroVinculoLoteProps = Readonly<{
  aberto: boolean;
  titulo: string;
  mensagem: string;
  vinculados: readonly VinculoErro[];
  width?: number;
  onOpenChange: (aberto: boolean) => void;
}>;
