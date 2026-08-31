import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Footer } from "@/components/layout/Footer";

type ImageMockProps = {
  src:
    | string
    | {
        src: string;
      };
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

vi.mock("next/image", () => ({
  default: ({ src, alt, fill, sizes, className, priority }: ImageMockProps) => {
    const enderecoImagem = typeof src === "string" ? src : src.src;

    return (
      <img
        src={enderecoImagem}
        alt={alt}
        sizes={sizes}
        className={className}
        data-fill={String(fill)}
        data-priority={String(priority)}
      />
    );
  },
}));

describe("Footer", () => {
  it("renderiza o rodapé", () => {
    render(<Footer />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renderiza o logo da Prefeitura de São Paulo", () => {
    render(<Footer />);

    const imagem = screen.getByRole("img", {
      name: "Prefeitura de São Paulo",
    });

    expect(imagem).toBeInTheDocument();

    expect(imagem.getAttribute("src")).toContain("logo_PrefSP_preto_sem");

    expect(imagem).toHaveAttribute("sizes", "100px");
    expect(imagem).toHaveAttribute("data-fill", "true");
    expect(imagem).toHaveAttribute("data-priority", "true");

    expect(imagem).toHaveClass("object-contain", "object-left");
  });

  it("renderiza a mensagem sobre os navegadores homologados", () => {
    render(<Footer />);

    expect(
      screen.getByText(
        "- Sistema homologado para navegadores: Google Chrome e Firefox",
      ),
    ).toBeInTheDocument();
  });

  it("aplica as classes de layout no rodapé", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");

    expect(footer).toHaveClass("w-full", "shrink-0", "px-8");

    const container = footer.firstElementChild;

    expect(container).toHaveClass(
      "flex",
      "h-20",
      "items-center",
      "justify-between",
      "border-t",
      "border-[#BFBFBF]",
      "py-6",
    );
  });

  it("aplica as classes no container do logo", () => {
    render(<Footer />);

    const imagem = screen.getByRole("img", {
      name: "Prefeitura de São Paulo",
    });

    const containerLogo = imagem.parentElement;

    expect(containerLogo).toHaveClass(
      "relative",
      "h-8",
      "w-[100px]",
      "shrink-0",
    );
  });

  it("aplica as classes no texto informativo", () => {
    render(<Footer />);

    const texto = screen.getByText(
      "- Sistema homologado para navegadores: Google Chrome e Firefox",
    );

    expect(texto).toHaveClass(
      "text-right",
      "text-sm",
      "text-[var(--footer-color)]",
    );
  });
});
