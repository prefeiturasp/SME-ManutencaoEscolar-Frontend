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
    <main className="flex min-h-screen bg-white">
      <section className="relative hidden min-h-screen w-1/2 lg:block">
        <Image
          src={imagemLogin}
          alt="Profissional realizando manutenção em uma escola"
          fill
          priority
          sizes="290px"
          className="object-cover object-center"
        />
      </section>
      <section className="flex min-h-screen flex-1 justify-center px-8 py-12">
        <div className="flex w-full max-w-115 flex-col">
          <Image
            src={logoManutencao}
            alt="Manutenção Escolar"
            priority
            className="mt-8 h-auto w-72.5 self-start"
          />
          <div className="mt-24 w-full">{children}</div>
          <Image
            src={logoPrefeitura}
            alt="Prefeitura de São Paulo"
            className="mt-12 h-auto w-52.5 flex self-center"
          />
        </div>
      </section>
    </main>
  );
}
