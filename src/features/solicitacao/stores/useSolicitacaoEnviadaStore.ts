import { create } from "zustand";

import type { SolicitacaoEnviadaState } from "../types/solicitacao.types";

export const useSolicitacaoEnviadaStore = create<SolicitacaoEnviadaState>((set) => ({
  codigo: null,
  enviada: false,
  abrir: (codigo, enviada = false) => set({ codigo, enviada }),
  fechar: () => set({ codigo: null, enviada: false }),
}));
