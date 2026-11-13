import logoPrefeituraPreto from "@/assets/images/logo_PrefSP_preto_sem fundo_horizontal.png";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full shrink-0 px-8">
      <div className="flex h-20 items-center justify-between border-t border-[#BFBFBF] py-6">
        <div className="relative h-8 w-[100px] shrink-0">
          <Image
            src={logoPrefeituraPreto}
            alt="Prefeitura de São Paulo"
            fill
            sizes="100px"
            className="object-contain object-left"
            priority
          />
        </div>

        <p className="text-right text-sm text-[var(--footer-color)]">
          - Sistema homologado para navegadores: Google Chrome e Firefox
        </p>
      </div>
    </footer>
  );
}
