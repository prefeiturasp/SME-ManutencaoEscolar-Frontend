"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/Header";
import { X } from "lucide-react";
import { Toaster } from "../ui/sonner";
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
          min-h-screen transition-[margin] duration-300
          ${abrirSidebar ? "ml-65" : "ml-20"}
        `}
      >
        <div className="p-8">{children}</div>
      </main>
      <Toaster
        position="top-right"
        offset={{
          top: 102,
          right: 20,
        }}
        icons={{
          close: <X className="size-6 text-[#4B5052] mt-6" strokeWidth={2.5} />,
        }}
      />
    </div>
  );
}
