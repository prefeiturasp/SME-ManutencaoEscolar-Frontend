"use client";

import { useState } from "react";

import { PageHeader } from "@/components/dashboard/PageHeader/PageHeader";
import { Sidebar } from "../dashboard/Sidebar/Sidebar";

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
          min-h-screen pt-[72px] transition-[margin] duration-300
          ${sidebarOpen ? "ml-[260px]" : "ml-[80px]"}
        `}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
