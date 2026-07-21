"use client";

import Image from "next/image";

import logo from "@/assets/images/logo.png";
import { BellIcon } from "@/components/icons/BellIcon";
import { PowerIcon } from "@/components/icons/PowerIcon";
import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { useRouter } from "next/navigation";

import { logout } from "@/features/login/hooks/logout";

type PageHeaderProps = {
  readonly abrirSidebar: boolean;
};

export function PageHeader({ abrirSidebar }: PageHeaderProps) {
  const router = useRouter();

  const usuario = useUsuarioStore((estado) => estado.usuario);
  const limparUsuario = useUsuarioStore((estado) => estado.limparUsuario);

  async function handleLogout() {
    await logout();

    limparUsuario();

    router.replace("/login");
  }

  return (
    <header
      className={`
        fixed right-0 top-0 z-50 flex h-[72px]
        items-center justify-between border-b bg-white px-6 shadow-sm
        transition-[left] duration-300
        ${abrirSidebar ? "left-[250px]" : "left-[80px]"}
      `}
    >
      {!abrirSidebar && (
        <Image
          src={logo}
          alt="Manutenção Escolar"
          width={135}
          height={40}
          className="h-auto w-[135px]"
          priority
        />
      )}

      <div className="ml-auto flex h-full items-center gap-5">
        {/* Dados do usuário */}
        <div className=" bg-[#F5F6F8] flex h-[48px] w-[210px] flex-col justify-center rounded-[3px] border-[1px] border-[#02408B] px-2 text-[11px] leading-[13px] text-zinc-600 mr-8">
          <p className="font-semibold text-zinc-700">
            RF: {usuario?.codigoRfOuCpf ?? "Não informado"}
          </p>

          <p>{usuario?.nome ?? "Usuário não informado"}</p>

          <p>{usuario?.cargo ?? "Cargo não informado"}</p>
        </div>

        {/* Notificações */}
        <button
          type="button"
          className="flex h-full min-w-15.5 flex-col items-center justify-center gap-1 text-zinc-400 hover:text-zinc-600 mr-4 cursor-pointer"
          aria-label="Abrir notificações"
        >
          <span className="relative">
            <BellIcon className="size-7 fill-blue-800 text-blue-800" />

            <span className="absolute -right-1.5 -top-1.25 flex size-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold leading-none text-white">
              23
            </span>
          </span>

          <span className="text-[10px] leading-none">Notificações</span>
        </button>

        {/* Sair */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-full min-w-9 flex-col items-center justify-center gap-1 cursor-pointer text-zinc-400 hover:text-zinc-600"
          aria-label="Sair"
        >
          <PowerIcon fill="var(--primary)" className="size-7" />

          <span className="text-[10px] leading-none">Sair</span>
        </button>
      </div>
    </header>
  );
}
