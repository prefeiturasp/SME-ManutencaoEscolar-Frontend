import { create } from "zustand";

import type { SolicitacaoManutencaoEnviadaState } from "../types/solicitacaoManutencao.types";

export const useSolicitacaoManutencaoEnviadaStore = create<SolicitacaoManutencaoEnviadaState>(
  (set) => ({
    codigo: null,
    enviada: false,
    editada: false,
    abrir: (codigo, enviada = false, editada = false) => set({ codigo, enviada, editada }),
    fechar: () => set({ codigo: null, enviada: false, editada: false }),
  }),
);
