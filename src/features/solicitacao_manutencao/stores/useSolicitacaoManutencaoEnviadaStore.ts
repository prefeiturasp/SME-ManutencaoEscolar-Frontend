import { create } from "zustand";

import type { SolicitacaoManutencaoEnviadaState } from "../types/solicitacaoManutencao.types";

export const useSolicitacaoManutencaoEnviadaStore = create<SolicitacaoManutencaoEnviadaState>((set) => ({
  codigo: null,
  enviada: false,
  abrir: (codigo, enviada = false) => set({ codigo, enviada }),
  fechar: () => set({ codigo: null, enviada: false }),
}));
