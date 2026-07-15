"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Menu, PlusCircle, X } from "lucide-react";

import logo from "@/assets/images/logo_branco.png";

type SidebarProps = {
  open: boolean;
  onToggle: () => void;
};

const cadastroItems = [
  { label: "Lotes", href: "/lotes" },
  { label: "Profissionais", href: "/profissionais" },
  { label: "Fornecedores", href: "/fornecedores" },
  { label: "Cargos", href: "/cargos" },
  { label: "Serviços", href: "/servicos" },
];

export function Sidebar({ open, onToggle }: Readonly<SidebarProps>) {
  const [cadastroOpen, setCadastroOpen] = useState(false);

  function handleCadastroClick() {
    if (!open) {
      onToggle();
      setCadastroOpen(true);
      return;
    }

    setCadastroOpen((current) => !current);
  }

  function handleToggleSidebar() {
    if (open) {
      setCadastroOpen(false);
    }

    onToggle();
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fechar menu ao clicar fora"
          onClick={handleToggleSidebar}
          className="fixed inset-0 z-50 cursor-default"
        />
      )}
      <aside
        className={`
        fixed inset-y-0 left-0 z-[60] bg-[#06366B]
        transition-[width] duration-300
        ${open ? "w-[260PX]" : "w-[80px]"}
      `}
      >
        <div
          className={`
          flex h-[72px] items-center border-b border-white/10
          ${open ? "justify-between px-5" : "justify-center"}
        `}
        >
          {open && (
            <Image
              src={logo}
              alt="Manutenção Escolar"
              width={107}
              height={32}
              className="h-auto w-[130px]"
              priority
            />
          )}

          <button
            type="button"
            onClick={handleToggleSidebar}
            className="flex size-10 cursor-pointer items-center justify-center text-white"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        <nav className="p-1">
          <button
            type="button"
            onClick={handleCadastroClick}
            className={`
            cursor-pointer
            group flex w-full transition-colors duration-200
            ${
              open
                ? "h-12 items-center justify-between rounded-t-[4px] px-4"
                : "h-[76px] flex-col items-center justify-center gap-2 rounded-[4px]"
            }
            ${
              cadastroOpen
                ? "bg-white text-[#F57C00]"
                : "bg-[#0B4F9C] text-white hover:bg-white hover:text-[#F57C00]"
            }
          `}
          >
            <span
              className={`
              flex items-center
              ${open ? "gap-3" : "flex-col gap-2"}
            `}
            >
              <PlusCircle
                className={`
                size-5 transition-colors
                ${
                  cadastroOpen
                    ? "text-[#F57C00]"
                    : "text-white group-hover:text-[#F57C00]"
                }
              `}
              />

              <span
                className={`
                font-medium transition-colors
                ${open ? "text-sm" : "text-xs"}
                ${
                  cadastroOpen
                    ? "text-[#F57C00]"
                    : "text-white group-hover:text-[#F57C00]"
                }
              `}
              >
                Cadastro
              </span>
            </span>

            {open &&
              (cadastroOpen ? (
                <ChevronUp className="size-5 text-[#F57C00]" />
              ) : (
                <ChevronDown className="size-5 text-white group-hover:text-[#F57C00]" />
              ))}
          </button>

          {open && cadastroOpen && (
            <div className="rounded-b-[4px] bg-white py-2">
              {cadastroItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="
                  block px-9 py-3 text-sm font-medium text-[#444]
                  transition-colors
                  hover:bg-[#F5F6F8] hover:text-[#F57C00]
                "
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
