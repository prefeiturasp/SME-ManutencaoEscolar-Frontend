"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/Header";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: Readonly<AppShellProps>) {
  const [abrirSidebar, setAbrirSidebar] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <Sidebar
        open={abrirSidebar}
        onToggle={() => setAbrirSidebar((current) => !current)}
      />

      <PageHeader abrirSidebar={abrirSidebar} />

      <main
        className={`
          min-h-screen pt-18 transition-[margin] duration-300
          ${abrirSidebar ? "ml-65" : "ml-20"}
        `}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
