import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { VisualizadorImagens } from "../shared/VisualizadorImagens/VisualizadorImagens";

describe("VisualizadorImagens", () => {
  it("exibe nome_original sem extrair o nome da URL assinada", () => {
    render(<VisualizadorImagens arquivos={[{ arquivo: "https://example.com/uuid.png?assinatura=123", nome_original: "Foto da sala.png", nome: "outro.png" }]} />);
    expect(screen.getByText("Foto da sala.png")).toBeInTheDocument();
    expect(screen.queryByText("uuid.png")).not.toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/uuid.png?assinatura=123");
  });
  it("navega entre imagens e documentos e aceita uma lista menor", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <VisualizadorImagens
        arquivos={[
          { arquivo: "/foto.jpg", nome: "Foto da parede", descricao: "Parede com fissura" },
          { arquivo: "/laudo.pdf" },
        ]}
      />,
    );
    expect(screen.getByRole("img", { name: "Parede com fissura" })).toHaveAttribute(
      "src",
      "/foto.jpg",
    );
    expect(screen.getByText("Foto da parede")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anexo anterior" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Próximo anexo" }));
    expect(screen.getByRole("link", { name: "Visualizar documento" })).toHaveAttribute(
      "href",
      "/laudo.pdf",
    );
    expect(screen.getByRole("button", { name: "Próximo anexo" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Anexo anterior" }));
    expect(screen.getByRole("img")).toHaveAttribute("src", "/foto.jpg");
    rerender(<VisualizadorImagens arquivos={[{ arquivo: "/outra.jpg" }]} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/outra.jpg");
    expect(screen.getByText("01 de 01 arquivos")).toBeInTheDocument();
  });

  it("trata ausência de anexos e não abre URLs inválidas", () => {
    const { rerender } = render(<VisualizadorImagens arquivos={[]} />);
    expect(screen.getByText("Nenhum anexo.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    rerender(<VisualizadorImagens arquivos={[{ arquivo: "javascript:alert(1)" }]} />);
    expect(screen.getByText("Anexo indisponível.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
