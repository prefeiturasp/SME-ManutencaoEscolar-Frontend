import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <div role="img" aria-label={alt} />,
}));

import AuthLayout from "../layout";

describe("AuthLayout", () => {
  it("deve renderizar os logos, a imagem lateral e o conteúdo", () => {
    render(
      <AuthLayout>
        <div>Conteúdo da redefinição de senha</div>
      </AuthLayout>,
    );

    expect(
      screen.getByText("Conteúdo da redefinição de senha"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: "Profissional realizando manutenção em uma escola",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: "Manutenção Escolar",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: "Prefeitura de São Paulo",
      }),
    ).toBeInTheDocument();
  });
});
