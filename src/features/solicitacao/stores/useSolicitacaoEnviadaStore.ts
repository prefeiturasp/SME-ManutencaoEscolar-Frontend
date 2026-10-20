import { create } from "zustand";

type SolicitacaoEnviadaState = {
  codigo: string | number | null;
  enviada: boolean;
  abrir: (codigo: string | number, enviada?: boolean) => void;
  fechar: () => void;
};

export const useSolicitacaoEnviadaStore = create<SolicitacaoEnviadaState>((set) => ({
  codigo: null,
  enviada: false,
  abrir: (codigo, enviada = false) => set({ codigo, enviada }),
  fechar: () => set({ codigo: null, enviada: false }),
}));
