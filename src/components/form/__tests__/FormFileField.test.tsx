import { useEffect } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { FieldPath, FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FormFileField } from "@/components/form/FormFileField";

interface TestForm {
  arquivos: File[];
}

function criarArquivo(nome: string, tipo = "application/pdf") {
  return new File(["conteudo"], nome, { type: tipo });
}

function Wrapper({
  name = "arquivos",
  label = "Arquivos",
  multiple,
  accept,
  className,
  errorMessage,
  onMethodsReady,
  valorInicial,
}: {
  readonly name?: FieldPath<TestForm>;
  readonly label?: string;
  readonly multiple?: boolean;
  readonly accept?: string;
  readonly className?: string;
  readonly errorMessage?: string;
  readonly onMethodsReady?: (methods: UseFormReturn<TestForm>) => void;
  readonly valorInicial?: File[] | undefined;
}) {
  const methods = useForm<TestForm>({
    defaultValues:
      valorInicial === undefined ? {} : { arquivos: valorInicial },
  });

  useEffect(() => {
    onMethodsReady?.(methods);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (errorMessage) {
      methods.setError(name, { type: "manual", message: errorMessage });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorMessage]);

  return (
    <FormProvider {...methods}>
      <FormFileField<TestForm>
        name={name}
        label={label}
        multiple={multiple}
        accept={accept}
        className={className}
      />
    </FormProvider>
  );
}

function getHiddenFileInput(container: HTMLElement) {
  return container.querySelector('input[type="file"]') as HTMLInputElement;
}

describe("FormFileField", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve renderizar label, placeholder e botão de escolher arquivo", () => {
    render(<Wrapper />);

    expect(screen.getByText("Arquivos")).toBeInTheDocument();

    const input = screen.getByPlaceholderText("Nenhum arquivo selecionado");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("readonly");
    expect(input).toHaveAttribute("id", "arquivos");
    expect(input).toHaveAttribute("aria-invalid", "false");

    expect(
      screen.getByRole("button", { name: /escolher arquivo/i }),
    ).toBeInTheDocument();
  });

  it("deve manter o input de arquivo oculto e repassar multiple e accept", () => {
    const { container } = render(
      <Wrapper multiple={false} accept="application/pdf" />,
    );

    const hiddenInput = getHiddenFileInput(container);

    expect(hiddenInput).toHaveClass("hidden");
    expect(hiddenInput).not.toHaveAttribute("multiple");
    expect(hiddenInput).toHaveAttribute("accept", "application/pdf");
  });

  it("deve abrir o seletor de arquivos ao clicar no botão", () => {
    const { container } = render(<Wrapper />);

    const hiddenInput = getHiddenFileInput(container);
    const clickSpy = vi.spyOn(hiddenInput, "click");

    fireEvent.click(screen.getByRole("button", { name: /escolher arquivo/i }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("deve abrir o seletor de arquivos ao clicar no input visível", () => {
    const { container } = render(<Wrapper />);

    const hiddenInput = getHiddenFileInput(container);
    const clickSpy = vi.spyOn(hiddenInput, "click");

    fireEvent.click(
      screen.getByPlaceholderText("Nenhum arquivo selecionado"),
    );

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("deve exibir os nomes dos arquivos selecionados e limpar erros", async () => {
    let methodsRef: UseFormReturn<TestForm> | undefined;

    const { container } = render(
      <Wrapper
        onMethodsReady={(methods) => {
          methodsRef = methods;
        }}
      />,
    );

    methodsRef?.setError("arquivos", {
      type: "manual",
      message: "Selecione um arquivo",
    });

    const arquivo1 = criarArquivo("documento.pdf");
    const arquivo2 = criarArquivo("planilha.xlsx");

    const hiddenInput = getHiddenFileInput(container);

    fireEvent.change(hiddenInput, {
      target: { files: [arquivo1, arquivo2] },
    });

    const input = await screen.findByPlaceholderText(
      "Nenhum arquivo selecionado",
    );

    expect(input).toHaveValue("documento.pdf, planilha.xlsx");
    expect(hiddenInput.value).toBe("");
    expect(
      screen.queryByText("Selecione um arquivo"),
    ).not.toBeInTheDocument();
  });

  it("deve exibir mensagem de erro quando o campo for inválido", () => {
    render(<Wrapper errorMessage="Arquivo é obrigatório" />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Arquivo é obrigatório",
    );

    expect(
      screen.getByPlaceholderText("Nenhum arquivo selecionado"),
    ).toHaveAttribute("aria-invalid", "true");
  });

  it("não deve exibir mensagem de erro quando não houver erro", () => {
    render(<Wrapper />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("deve aplicar className customizada ao container", () => {
    const { container } = render(<Wrapper className="custom-wrapper" />);

    expect(container.querySelector(".custom-wrapper")).toBeInTheDocument();
  });

  it("deve tratar valor indefinido do campo como lista vazia", () => {
    render(<Wrapper valorInicial={undefined} />);

    expect(
      screen.getByPlaceholderText("Nenhum arquivo selecionado"),
    ).toHaveValue("");
  });

  it("deve tratar seleção sem arquivos como lista vazia", () => {
    const { container } = render(<Wrapper />);

    const hiddenInput = getHiddenFileInput(container);

    fireEvent.change(hiddenInput, {
      target: { files: null },
    });

    expect(
      screen.getByPlaceholderText("Nenhum arquivo selecionado"),
    ).toHaveValue("");
  });
});
