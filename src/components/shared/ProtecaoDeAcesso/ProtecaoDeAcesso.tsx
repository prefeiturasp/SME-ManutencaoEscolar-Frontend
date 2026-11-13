"use client";

import { Home } from "lucide-react";
import type { ReactNode } from "react";

import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import type { Funcionalidade } from "@/constants/funcionalidades";
import { useUsuarioAutenticado } from "@/features/login/hooks/useUsuarioAutenticado";
import { useUsuarioStore } from "@/stores/useUsuarioStore";

type ProtecaoDeAcessoProps = Readonly<{
  funcionalidade: Funcionalidade;
  children: ReactNode;
}>;

/**
 * Bloqueia o acesso às páginas cujo perfil do usuário não possui a
 * funcionalidade exigida. A decisão usa os dados atuais de `/usuarios/me`;
 * se a consulta falhar, usa o último usuário conhecido.
 */
export function ProtecaoDeAcesso({ funcionalidade, children }: ProtecaoDeAcessoProps) {
  const { data, isPending } = useUsuarioAutenticado();
  const usuarioSalvo = useUsuarioStore((estado) => estado.usuario);

  if (isPending) return <LoadingGlobal exibir />;

  const usuario = data ?? usuarioSalvo;

  if (!usuario?.funcionalidades?.includes(funcionalidade)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <ListaVazio
          titulo="Você não tem permissão para acessar esta página"
          descricao="Seu perfil de acesso não permite visualizar este conteúdo."
          textoBotao="Voltar para o início"
          href="/"
          primary
          icone={Home}
        />
      </div>
    );
  }

  return children;
}
