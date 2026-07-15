"use client";

import Image from "next/image";

import logo from "@/assets/images/logo.png";
import { PowerIcon } from "@/components/icons/PowerIcon";
import { BellIcon } from "@/components/icons/BellIcon";

type PageHeaderProps = {
  readonly sidebarOpen: boolean;
};

export function PageHeader({ sidebarOpen }: PageHeaderProps) {
  return (
    <header
      className={`
        fixed right-0 top-0 z-50 flex h-[72px]
        items-center justify-between border-b bg-white px-6 shadow-sm
        transition-[left] duration-300
        ${sidebarOpen ? "left-[250px]" : "left-[80px]"}
      `}
    >
      {!sidebarOpen && (
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
          <p className="font-semibold text-zinc-700">RF: 1234567</p>

          <p>Mário de Almeida Silva</p>
          <p>Fornecedor</p>
        </div>

        {/* Notificações */}
        <button
          type="button"
          className="flex h-full min-w-[62px] flex-col items-center justify-center gap-1 text-zinc-400 hover:text-zinc-600 mr-4 cursor-pointer"
          aria-label="Abrir notificações"
        >
          <span className="relative">
            <BellIcon className="size-[28px] fill-blue-800 text-blue-800" />

            <span className="absolute -right-[6px] -top-[5px] flex size-[14px] items-center justify-center rounded-full bg-red-600 text-[8px] font-bold leading-none text-white">
              23
            </span>
          </span>

          <span className="text-[10px] leading-none">Notificações</span>
        </button>

        {/* Sair */}
        <button
          type="button"
          className="flex h-full min-w-[36px] flex-col items-center justify-center gap-1 text-zinc-400 hover:text-zinc-600 cursor-pointer"
          aria-label="Sair"
        >
          <PowerIcon className="size-[28px] " />

          <span className="text-[10px] leading-none">Sair</span>
        </button>
      </div>
    </header>
  );
}
