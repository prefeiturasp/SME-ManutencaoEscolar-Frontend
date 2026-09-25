export type CargoEol = {
  id: number;
  codigo: string;
  nome: string;
  perfil: string;
  ativo: boolean;
};


export type RespostaCargoEOL = {
  count: number;
  next: string | null;
  previous: string | null;
  results: CargoEol[];
};