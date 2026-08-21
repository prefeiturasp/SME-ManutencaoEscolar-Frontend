export type LoteCriado = {
  id: number;
  uuid: string;
  codigo_cadastro: string;
  nome: string;
  status: boolean;
  periodo_inicial: string;
  periodo_final: string;
};

export type DreVinculada = [dre: string, lote: string];

export type CriarLoteResultado =
  | {
      success: true;
      lote: LoteCriado;
    }
  | {
      success: false;
      error: "api-error";
      title: string;
      message: string;
      vinculados?: DreVinculada[];
      status?: number;
    };
