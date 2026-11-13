import imagemLogin from "@/assets/images/imagem_login.png";
import logoManutencao from "@/assets/images/logo.png";
import logoPrefeitura from "@/assets/images/logo_PrefSP_sem fundo_horizontal_fundo_claro.png";
import Image from "next/image";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: Readonly<AuthLayoutProps>) {
  return (
    <main className="flex h-dvh overflow-hidden bg-white">
      <section className="relative hidden h-dvh w-1/2 shrink-0 lg:block">
        <Image
          src={imagemLogin}
          alt="Profissional realizando manutenção em uma escola"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center"
        />
      </section>

      <section className="flex h-dvh flex-1 justify-center overflow-y-auto px-8 py-12 [scrollbar-gutter:stable_both-edges]">
        <div className="flex w-full max-w-115 flex-col">
          <Image
            src={logoManutencao}
            alt="Manutenção Escolar"
            priority
            className="mt-8 h-auto w-72.5 self-start"
          />

          <div className="mt-12 w-full">{children}</div>

          <Image
            src={logoPrefeitura}
            alt="Prefeitura de São Paulo"
            className="mt-12 h-auto w-52.5 self-center"
          />

          <div className="h-20 shrink-0" aria-hidden="true" />
        </div>
      </section>
    </main>
  );
}
