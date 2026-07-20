import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AuthLayout from "../layout";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

describe("AuthLayout", () => {
  it("deve renderizar os children", () => {
    render(
      <AuthLayout>
        <div>Conteúdo de teste</div>
      </AuthLayout>,
    );

    expect(screen.getByText("Conteúdo de teste")).toBeInTheDocument();
  });

  it("deve renderizar a imagem de fundo", () => {
    render(
      <AuthLayout>
        <div />
      </AuthLayout>,
    );

    expect(
      screen.getByAltText("Profissional realizando manutenção em uma escola"),
    ).toBeInTheDocument();
  });

  it("deve renderizar o logo da Manutenção Escolar", () => {
    render(
      <AuthLayout>
        <div />
      </AuthLayout>,
    );

    expect(screen.getByAltText("Manutenção Escolar")).toBeInTheDocument();
  });

  it("deve renderizar o logo da Prefeitura", () => {
    render(
      <AuthLayout>
        <div />
      </AuthLayout>,
    );

    expect(screen.getByAltText("Prefeitura de São Paulo")).toBeInTheDocument();
  });

  it("deve renderizar a estrutura principal", () => {
    const { container } = render(
      <AuthLayout>
        <div />
      </AuthLayout>,
    );

    expect(container.querySelector("main")).toBeInTheDocument();
  });
});
