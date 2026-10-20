import { create } from "zustand";

type SolicitacaoEnviadaState = {
  codigo: string | number | null;
  abrir: (codigo: string | number) => void;
  fechar: () => void;
};

export const useSolicitacaoEnviadaStore = create<SolicitacaoEnviadaState>((set) => ({
  codigo: null,
  abrir: (codigo) => set({ codigo }),
  fechar: () => set({ codigo: null }),
}));
