"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/Header";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: Readonly<AppShellProps>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((current) => !current)}
      />

      <PageHeader sidebarOpen={sidebarOpen} />

      <main
        className={`
          min-h-screen pt-18 transition-[margin] duration-300
          ${sidebarOpen ? "ml-65" : "ml-20"}
        `}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
