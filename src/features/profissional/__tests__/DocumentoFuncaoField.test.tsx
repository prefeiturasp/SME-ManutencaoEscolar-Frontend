import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { DocumentoFuncaoField } from "@/features/profissional/components/form/DocumentoFuncaoField";
import type { ProfissionalSchema } from "@/features/profissional/schemas/profissional.schema";

const { baixarArquivo } = vi.hoisted(() => ({ baixarArquivo: vi.fn() }));

vi.mock("@/utils/arquivo", () => ({ baixarArquivo }));

function Wrapper({
  comDocumento = false,
  semArquivoInicial = false,
}: {
  readonly comDocumento?: boolean;
  readonly semArquivoInicial?: boolean;
}) {
  const methods = useForm<ProfissionalSchema>({
    defaultValues: {
      nome: "",
      rg: "",
      cpf: "",
      funcoes: [
        {
          uuid_cargo: "cargo-1",
          documentos: [
            comDocumento
              ? {
                  uuid: "documento-1",
                  nome_original: "registro.pdf",
                  arquivo_url: "https://example.com/registro.pdf",
                  arquivo: [],
                }
              : { arquivo: semArquivoInicial ? undefined : [] },
          ],
        },
      ],
    },
  });

  return (
    <FormProvider {...methods}>
      <DocumentoFuncaoField indiceFuncao={0} indiceDocumento={0} label="Registro" />
    </FormProvider>
  );
}

describe("DocumentoFuncaoField", () => {
  it("exibe o estado vazio e abre o seletor de arquivos", () => {
    const { container } = render(<Wrapper semArquivoInicial />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const click = vi.spyOn(input, "click");

    expect(screen.getByText("Selecione um arquivo")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Escolher arquivo" }));

    expect(click).toHaveBeenCalledOnce();
  });

  it("ignora o cancelamento da seleção de arquivo", () => {
    const { container } = render(<Wrapper />);

    fireEvent.change(container.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: null },
    });

    expect(screen.getByText("Selecione um arquivo")).toBeInTheDocument();
  });

  it("exibe e baixa o documento persistido", () => {
    render(<Wrapper comDocumento />);

    const link = screen.getByRole("link", { name: "Baixar arquivo registro.pdf" });
    expect(link).toHaveAttribute("href", "https://example.com/registro.pdf");
    fireEvent.click(link);
    expect(baixarArquivo).toHaveBeenCalledWith({
      nome: "registro.pdf",
      url: "https://example.com/registro.pdf",
    });
  });

  it("substitui o documento persistido por um arquivo local", () => {
    const { container } = render(<Wrapper comDocumento />);
    const arquivo = new File(["novo"], "novo.pdf", { type: "application/pdf" });

    fireEvent.change(container.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [arquivo] },
    });

    expect(screen.getByText("novo.pdf")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /baixar arquivo/i })).not.toBeInTheDocument();
  });

  it("remove um arquivo local selecionado", () => {
    const { container } = render(<Wrapper />);
    const arquivo = new File(["novo"], "novo.pdf", { type: "application/pdf" });

    fireEvent.change(container.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [arquivo] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Remover arquivo novo.pdf" }));

    expect(screen.getByText("Selecione um arquivo")).toBeInTheDocument();
  });

  it("remove o documento persistido e passa a exigir um novo arquivo", () => {
    render(<Wrapper comDocumento />);

    fireEvent.click(screen.getByRole("button", { name: "Remover arquivo registro.pdf" }));

    expect(screen.getByText("Selecione um arquivo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Escolher arquivo" })).toBeInTheDocument();
  });
});
