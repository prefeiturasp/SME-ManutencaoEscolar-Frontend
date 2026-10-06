"use client";

import { ChevronDown, ChevronUp, Menu, PlusCircle, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import logo from "@/assets/images/logo_branco.png";

type SidebarProps = {
  open: boolean;
  onToggle: () => void;
};

const cadastroItems = [
  { label: "Serviços", href: "/servicos" },
  { label: "Lotes", href: "/lotes" },
  { label: "Profissionais", href: "/profissionais" },
  { label: "Unidades Educacionais", href: "/unidades-educacionais" },
  { label: "Cargos", href: "/cargos" },
];

const empresasItems = [
  { label: "Equipes", href: "/empresas/equipes" },
  { label: "Empresas", href: "/empresas" },
];

export function Sidebar({ open, onToggle }: Readonly<SidebarProps>) {
  const [cadastroOpen, setCadastroOpen] = useState(false);
  const [empresasOpen, setEmpresasOpen] = useState(false);

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
      setEmpresasOpen(false);
    }

    onToggle();
  }

  function handleFecharSidebar() {
    setCadastroOpen(false);
    setEmpresasOpen(false);
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
          ${open ? "w-[260px]" : "w-[80px]"}
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

        <nav className="max-h-[calc(100dvh-72px)] overflow-y-auto p-1">
          <button
            type="button"
            onClick={handleCadastroClick}
            aria-expanded={open && cadastroOpen}
            aria-controls="submenu-cadastro"
            className={`
              group flex w-full cursor-pointer bg-white text-secondary
              transition-colors duration-200
              ${
                open
                  ? "h-12 items-center justify-between rounded-t-[4px] px-4"
                  : "h-[76px] flex-col items-center justify-center gap-2 rounded-[4px]"
              }
            `}
          >
            <span
              className={`
                flex items-center
                ${open ? "gap-3" : "flex-col gap-2"}
              `}
            >
              <PlusCircle className="size-5 text-secondary" />

              <span
                className={`
                  font-medium text-secondary
                  ${open ? "text-sm" : "text-xs"}
                `}
              >
                Cadastro
              </span>
            </span>

            {open &&
              (cadastroOpen ? (
                <ChevronUp className="size-5 text-secondary" />
              ) : (
                <ChevronDown className="size-5 text-secondary" />
              ))}
          </button>

          {open && cadastroOpen && (
            <div id="submenu-cadastro" className="rounded-b-lg bg-white py-2">
              <button
                type="button"
                onClick={() => setEmpresasOpen((current) => !current)}
                aria-expanded={empresasOpen}
                aria-controls="submenu-empresas"
                className={`
                  flex w-full cursor-pointer items-center justify-between
                  py-3 pl-9 pr-4 text-sm font-medium transition-colors
                  hover:bg-[#F5F6F8] hover:text-secondary
                  ${empresasOpen ? "text-secondary" : "text-gray"}
                `}
              >
                <span>Empresas</span>

                {empresasOpen ? (
                  <ChevronUp className="size-5" />
                ) : (
                  <ChevronDown className="size-5" />
                )}
              </button>

              {empresasOpen && (
                <div id="submenu-empresas">
                  {empresasItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleFecharSidebar}
                      className="
                        block py-3 pl-12 pr-4 text-sm font-medium text-gray
                        transition-colors
                        hover:bg-[#F5F6F8] hover:text-secondary
                      "
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}

              {cadastroItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleFecharSidebar}
                  className="
                    block px-9 py-3 text-sm font-medium text-gray
                    transition-colors
                    hover:bg-[#F5F6F8] hover:text-secondary
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
