import type { ReactNode } from "react";

import imagemLogin from "@/assets/images/imagem_login.png";
import logoManutencao from "@/assets/images/logo.png";
import logoPrefeitura from "@/assets/images/logo_PrefSP_sem fundo_horizontal_fundo_claro.png";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: Readonly<AuthLayoutProps>) {
  return (
    <main className="flex min-h-screen bg-white">
      <section className="relative hidden min-h-screen w-1/2 lg:block">
        <img
          src={imagemLogin.src}
          alt="Profissional realizando manutenção em uma escola"
          className="absolute inset-0 size-full object-cover object-center"
        />
      </section>
      <section className="flex min-h-screen flex-1 justify-center px-8 py-12">
        <div className="flex w-full max-w-115 flex-col">
          <img
            src={logoManutencao.src}
            alt="Manutenção Escolar"
            className="mt-8 h-auto w-72.5 self-start"
          />
          <div className="mt-24 w-full">{children}</div>
          <img
            src={logoPrefeitura.src}
            alt="Prefeitura de São Paulo"
            className="mt-12 h-auto w-52.5 self-center"
          />
        </div>
      </section>
    </main>
  );
}
