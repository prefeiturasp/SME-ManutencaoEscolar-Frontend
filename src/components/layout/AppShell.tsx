"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useUsuarioAutenticado } from "@/features/login/hooks/useUsuarioAutenticado";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: Readonly<AppShellProps>) {
  const [abrirSidebar, setAbrirSidebar] = useState(false);

  useUsuarioAutenticado();

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden">
      <Sidebar
        open={abrirSidebar}
        onToggle={() => setAbrirSidebar((current) => !current)}
      />

      <PageHeader abrirSidebar={abrirSidebar} />

      <div
        className={`
          flex flex-1 flex-col transition-[margin] duration-300
          ${abrirSidebar ? "ml-65" : "ml-20"}
        `}
      >
        <main className="flex-1 p-8">{children}</main>

        <Footer />
      </div>

      <Toaster
        position="top-right"
        offset={{
          top: 102,
          right: 20,
        }}
        icons={{
          close: <X className="mt-6 size-6 text-[#4B5052]" strokeWidth={2.5} />,
        }}
      />
    </div>
  );
}
