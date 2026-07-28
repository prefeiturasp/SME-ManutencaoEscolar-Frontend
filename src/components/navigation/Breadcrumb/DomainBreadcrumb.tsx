"use client";

import { HomeIcon } from "@/components/icons/HomeIcon";
import { Breadcrumb } from "@/components/navigation/Breadcrumb/Breadcrumb";
import type { ItemBreadcrumb } from "@/components/navigation/Breadcrumb/types/Breadcrumb.types";
import { usePathname } from "next/navigation";

type ConfiguracaoDominio = {
  rotuloPlural: string;
  rotuloSingular?: string;
};

type PropriedadesDomainBreadcrumb = Readonly<{
  basePath: string;
  baseLabel: string;
  domains?: Record<string, ConfiguracaoDominio>;
  className?: string;
  homePath?: string;
  homeLabel?: string;
}>;

function normalizarCaminho(path: string) {
  if (path === "/") {
    return "/";
  }

  let caminhoNormalizado = path;

  while (caminhoNormalizado.length > 1 && caminhoNormalizado.endsWith("/")) {
    caminhoNormalizado = caminhoNormalizado.slice(0, -1);
  }

  return caminhoNormalizado;
}

function estaNoCaminhoBase(pathname: string, basePath: string) {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function formatarRotulo(segmento: string) {
  return segmento
    .replaceAll("-", " ")
    .replaceAll(/\b\w/g, (letra) => letra.toUpperCase());
}

function obterRotuloSingular(
  dominio: ConfiguracaoDominio,
  segmentoDominio: string,
) {
  if (dominio.rotuloSingular) {
    return dominio.rotuloSingular;
  }

  return formatarRotulo(segmentoDominio).replace(/s$/i, "");
}

function gerarItens(
  pathname: string,
  basePath: string,
  baseLabel: string,
  domains: Record<string, ConfiguracaoDominio>,
  homePath: string,
  homeLabel: string,
) {
  const pathnameNormalizado = normalizarCaminho(pathname);
  const caminhoBaseNormalizado = normalizarCaminho(basePath);
  const partesPath = pathnameNormalizado.split("/").filter(Boolean);
  const partesBase = caminhoBaseNormalizado.split("/").filter(Boolean);
  const segmentos = partesPath.slice(partesBase.length);

  const itens: ItemBreadcrumb[] = [
    {
      rotulo: homeLabel,
      caminho: homePath,
      icone: <HomeIcon className="size-4" />,
    },
    {
      rotulo: baseLabel,
      ...(segmentos.length
        ? { caminho: caminhoBaseNormalizado }
        : { paginaAtual: true }),
    },
  ];

  if (!segmentos.length) {
    return itens;
  }

  const [segmentoDominio] = segmentos;
  const configuracaoDominio = domains[segmentoDominio];
  const singularDominio = configuracaoDominio
    ? obterRotuloSingular(configuracaoDominio, segmentoDominio)
    : undefined;

  for (let indice = 0; indice < segmentos.length; indice += 1) {
    const segmento = segmentos[indice];
    const ultimoItem = indice === segmentos.length - 1;
    const caminho = `${caminhoBaseNormalizado}/${segmentos.slice(0, indice + 1).join("/")}`;

    let rotulo: string;

    if (indice === 0 && configuracaoDominio) {
      rotulo = configuracaoDominio.rotuloPlural;
    } else if (segmento === "cadastrar" && singularDominio) {
      rotulo = `Cadastrar ${singularDominio}`;
    } else {
      rotulo = formatarRotulo(segmento);
    }

    itens.push({
      rotulo,
      ...(ultimoItem ? { paginaAtual: true } : { caminho }),
    });
  }

  return itens;
}

export function DomainBreadcrumb({
  basePath,
  baseLabel,
  domains = {},
  className,
  homePath = "/",
  homeLabel = "Início",
}: PropriedadesDomainBreadcrumb) {
  const pathname = usePathname();

  if (!pathname) {
    return null;
  }

  const pathnameNormalizado = normalizarCaminho(pathname);
  const caminhoBaseNormalizado = normalizarCaminho(basePath);

  if (!estaNoCaminhoBase(pathnameNormalizado, caminhoBaseNormalizado)) {
    return null;
  }

  const itens = gerarItens(
    pathnameNormalizado,
    caminhoBaseNormalizado,
    baseLabel,
    domains,
    homePath,
    homeLabel,
  );

  return <Breadcrumb className={className} itens={itens} />;
}
