"use client";

import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          Status da API
        </p>

        <h1 className="mt-3 text-3xl font-semibold">Health check</h1>

        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
          O endpoint retornou:
        </p>

        <div className="mt-6 rounded-xl bg-zinc-100 px-4 py-3 text-lg font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50">
          <Button>
            <PlusIcon className="w-10 h-10 text-white" />
            Cadastrar fornecedor
          </Button>
        </div>
      </div>
    </main>
  );
}
