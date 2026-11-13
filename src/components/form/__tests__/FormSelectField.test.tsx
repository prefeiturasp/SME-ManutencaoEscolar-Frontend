import { useEffect } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm, type UseFormReturn } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { FormSelectField } from "@/components/form/FormSelectField";

type Dados = { conselho?: string };
const options = [{ value: "crea", label: "CREA" }, { value: "cau", label: "CAU" }];
let form: UseFormReturn<Dados>;
function Formulario({ value, placeholder }: { value?: string; placeholder?: string }) {
  const methods = useForm<Dados>({ defaultValues: { conselho: value } });
  useEffect(() => { form = methods; }, [methods]);
  return <FormProvider {...methods}><FormSelectField<Dados> name="conselho" label="Conselho" options={options} placeholder={placeholder} /></FormProvider>;
}

describe("FormSelectField", () => {
  it("associa o rótulo, usa o placeholder padrão e permite receber foco", () => {
    render(<Formulario />);
    const select = screen.getByRole("combobox", { name: "Conselho" });
    expect(select).toHaveTextContent("Selecione");
    expect(select).toHaveAttribute("aria-invalid", "false");
    select.focus();
    expect(select).toHaveFocus();
  });

  it("aceita placeholder personalizado e valor inicial", () => {
    const { unmount } = render(<Formulario placeholder="Escolha um conselho" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Escolha um conselho");
    unmount();
    render(<Formulario value="crea" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("CREA");
  });

  it("atualiza o valor, limpa o erro e marca o campo como tocado ao selecionar", async () => {
    const user = userEvent.setup();
    render(<Formulario />);
    act(() => form.setError("conselho", { message: "Conselho obrigatório" }));
    expect(screen.getByText("Conselho obrigatório")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
    await user.click(screen.getByRole("combobox"));
    expect(form.getFieldState("conselho").isTouched).toBe(false);
    await user.click(screen.getByRole("option", { name: "CAU" }));
    await waitFor(() => expect(form.getValues("conselho")).toBe("cau"));
    expect(form.getFieldState("conselho").isTouched).toBe(true);
    expect(screen.queryByText("Conselho obrigatório")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveTextContent("CAU");
  });

  it("valida ao fechar sem selecionar", async () => {
    const user = userEvent.setup();
    render(<Formulario />);
    form.register("conselho", { required: "Selecione um conselho" });
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Escape}");
    expect(await screen.findByText("Selecione um conselho")).toBeInTheDocument();
    expect(form.getFieldState("conselho").isTouched).toBe(true);
  });
});
