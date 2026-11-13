import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { LoginUser } from "@/features/login/types/login.types";

type UsuarioStore = {
  usuario: LoginUser | null;
  definirUsuario: (usuario: LoginUser) => void;
  limparUsuario: () => void;
};

export const useUsuarioStore = create<UsuarioStore>()(
  persist(
    (set) => ({
      usuario: null,

      definirUsuario: (usuario) => {
        set({ usuario });
      },

      limparUsuario: () => {
        set({ usuario: null });
      },
    }),
    {
      name: "usuario-logado",
    },
  ),
);
