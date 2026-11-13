import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { LogoEmpresaField } from "../components/form/LogoEmpresaField";
import { empresaSchema, type EmpresaSchema } from "../schemas/empresa.schema";

const logoSchema = z.object({ logo: empresaSchema.shape.logo });

let valorAtual: unknown;

function Espiao() {
  const logo = useWatch<EmpresaSchema, "logo">({ name: "logo" });

  useEffect(() => {
    valorAtual = logo;
  }, [logo]);

  return null;
}

function Wrapper({ logo }: { readonly logo?: File | string | null }) {
  const form = useForm<EmpresaSchema>({
    resolver: zodResolver(logoSchema) as never,
    defaultValues: { logo } as EmpresaSchema,
  });

  return (
    <FormProvider {...form}>
      <Espiao />
      <LogoEmpresaField />
    </FormProvider>
  );
}

const windowOpenMock = vi.fn();

describe("LogoEmpresaField", () => {
  beforeEach(() => {
    vi.stubGlobal("open", windowOpenMock);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:previa");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    windowOpenMock.mockReset();
  });

  it("exibe o estado vazio com os formatos suportados", () => {
    render(<Wrapper logo={null} />);

    expect(screen.getByText("Logo da empresa")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nenhuma imagem selecionada")).toHaveValue("");
    expect(screen.getByRole("button", { name: /escolher imagem/i })).toBeInTheDocument();
    expect(screen.getByText("Formatos suportados: png, jpeg e jpg.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /remover logo/i })).not.toBeInTheDocument();
  });

  it("seleciona uma imagem, mostra nome e prévia e permite visualizar", async () => {
    const user = userEvent.setup();
    render(<Wrapper logo={null} />);
    const arquivo = new File(["img"], "IMG_001.jpg", { type: "image/jpeg" });

    await user.upload(screen.getByTestId("logo-input"), arquivo);

    expect(screen.getByPlaceholderText("Nenhuma imagem selecionada")).toHaveValue("IMG_001.jpg");
    expect(screen.getByAltText("Prévia da logo IMG_001.jpg")).toHaveAttribute("src", "blob:previa");
    expect(valorAtual).toBe(arquivo);

    await user.click(screen.getByRole("button", { name: "Visualizar logo IMG_001.jpg" }));
    expect(windowOpenMock).toHaveBeenCalledWith("blob:previa", "_blank", "noopener,noreferrer");
  });

  it("remove a imagem selecionada", async () => {
    const user = userEvent.setup();
    render(<Wrapper logo={null} />);
    await user.upload(
      screen.getByTestId("logo-input"),
      new File(["img"], "logo.png", { type: "image/png" }),
    );

    await user.click(screen.getByRole("button", { name: "Remover logo logo.png" }));

    expect(valorAtual).toBeNull();
    expect(screen.queryByAltText(/prévia da logo/i)).not.toBeInTheDocument();
  });

  it("mostra a logo já salva e permite removê-la", async () => {
    const user = userEvent.setup();
    render(<Wrapper logo="https://minio.exemplo.com/empresas/logos/abc%20def.png?X=1" />);

    expect(screen.getByAltText("Prévia da logo abc def.png")).toHaveAttribute(
      "src",
      "https://minio.exemplo.com/empresas/logos/abc%20def.png?X=1",
    );

    await user.click(screen.getByRole("button", { name: "Remover logo abc def.png" }));
    expect(valorAtual).toBeNull();
  });

  it("usa o nome genérico quando a URL salva é inválida", () => {
    render(<Wrapper logo="url-invalida" />);

    expect(screen.getByAltText("Prévia da logo logo")).toBeInTheDocument();
  });

  it("exibe o erro e esconde a prévia para formato inválido", async () => {
    render(<Wrapper logo={null} />);

    fireEvent.change(screen.getByTestId("logo-input"), {
      target: { files: [new File(["x"], "logo.gif", { type: "image/gif" })] },
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A logo deve ser um arquivo PNG, JPG ou JPEG.",
    );
    expect(screen.queryByAltText(/prévia da logo/i)).not.toBeInTheDocument();
  });

  it("ignora a seleção vazia e abre o seletor pelo campo e pelo botão", async () => {
    const user = userEvent.setup();
    render(<Wrapper logo={null} />);
    const input = screen.getByTestId("logo-input") as HTMLInputElement;
    const clique = vi.spyOn(input, "click");

    fireEvent.change(input, { target: { files: [] } });
    expect(valorAtual).toBeNull();

    await user.click(screen.getByPlaceholderText("Nenhuma imagem selecionada"));
    await user.click(screen.getByRole("button", { name: /escolher imagem/i }));
    expect(clique).toHaveBeenCalledTimes(2);
  });
});
