import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PlusIcon } from "@/components/icons/plus";
import { PowerIcon } from "@/components/icons/PowerIcon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirmaDialogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

describe("componentes de interface", () => {
  it("renderiza o botão padrão e todas as suas variantes", () => {
    const { rerender } = render(<Button className="custom">Salvar</Button>);

    expect(screen.getByRole("button", { name: "Salvar" })).toHaveAttribute(
      "data-variant",
      "default",
    );
    expect(screen.getByRole("button")).toHaveClass("custom");

    for (const variant of [
      "outline",
      "secondary",
      "ghost",
      "destructive",
      "link",
    ] as const) {
      rerender(<Button variant={variant}>{variant}</Button>);
      expect(screen.getByRole("button")).toHaveAttribute(
        "data-variant",
        variant,
      );
    }

    for (const size of [
      "xs",
      "sm",
      "lg",
      "icon",
      "icon-xs",
      "icon-sm",
      "icon-lg",
    ] as const) {
      rerender(<Button size={size}>{size}</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-size", size);
    }

    expect(buttonVariants({ variant: "link", size: "icon" })).toContain(
      "underline-offset-4",
    );
  });

  it("permite que Button repasse suas propriedades para um filho", () => {
    render(
      <Button asChild>
        <a href="/empresas">Empresas</a>
      </Button>,
    );

    expect(screen.getByRole("link", { name: "Empresas" })).toHaveAttribute(
      "href",
      "/empresas",
    );
  });

  it("renderiza cartões e seus subcomponentes", () => {
    render(
      <>
        <Card className="card-custom">
          <CardHeader>
            <CardTitle>Título</CardTitle>
            <CardDescription>Descrição</CardDescription>
            <CardAction>Ação</CardAction>
          </CardHeader>
          <CardContent>Conteúdo</CardContent>
          <CardFooter>Rodapé</CardFooter>
        </Card>
        <Card size="sm">Pequeno</Card>
      </>,
    );

    expect(screen.getByText("Título")).toHaveAttribute(
      "data-slot",
      "card-title",
    );
    expect(screen.getByText("Pequeno")).toHaveAttribute("data-size", "sm");
    expect(screen.getByText("Título").closest("[data-slot=card]")).toHaveClass(
      "card-custom",
    );
  });

  it("renderiza input, label e ícone com as propriedades recebidas", () => {
    render(
      <>
        <Label htmlFor="nome" className="label-custom">
          Nome
        </Label>
        <Input id="nome" type="email" className="input-custom" />
        <PlusIcon aria-label="Adicionar" className="icon-custom" />
      </>,
    );

    expect(screen.getByLabelText("Nome")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Nome")).toHaveClass("input-custom");
    expect(screen.getByText("Nome")).toHaveClass("label-custom");
    expect(screen.getByLabelText("Adicionar")).toHaveClass("icon-custom");
  });

  it("usa a cor padrão do ícone de energia quando ela não é informada", () => {
    const { container, rerender } = render(<PowerIcon />);

    expect(container.querySelector("rect")).toHaveAttribute(
      "fill",
      "var(--primary)",
    );

    rerender(<PowerIcon fill="red" />);

    expect(container.querySelector("rect")).toHaveAttribute("fill", "red");
  });

  it("renderiza tabela e todos os seus elementos estruturais", () => {
    render(
      <Table className="table-custom">
        <TableCaption>Empresas</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Escola</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );

    expect(screen.getByRole("table")).toHaveClass("table-custom");
    expect(screen.getByText("Nome")).toHaveAttribute("data-slot", "table-head");
    expect(screen.getByText("Escola")).toHaveAttribute(
      "data-slot",
      "table-cell",
    );
    expect(screen.getByText("Empresas")).toHaveAttribute(
      "data-slot",
      "table-caption",
    );
    expect(screen.getByRole("table").parentElement).toHaveAttribute(
      "data-slot",
      "table-container",
    );
  });

  it("renderiza todos os elementos do alerta", () => {
    render(
      <AlertDialog open>
        <AlertDialogTrigger>Abrir alerta</AlertDialogTrigger>

        <AlertDialogContent size="sm" className="alerta-custom">
          <AlertDialogHeader>
            <AlertDialogMedia>!</AlertDialogMedia>

            <AlertDialogTitle>Título do alerta</AlertDialogTitle>

            <AlertDialogDescription>Descrição do alerta</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>

            <AlertDialogAction>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    expect(
      document.querySelector("[data-slot=alert-dialog-trigger]"),
    ).toHaveAttribute("data-slot", "alert-dialog-trigger");

    expect(screen.getByText("!")).toHaveAttribute(
      "data-slot",
      "alert-dialog-media",
    );

    const alerta = screen.getByRole("alertdialog");

    expect(alerta).toHaveAttribute("data-size", "sm");

    const painel = document.querySelector(".alerta-custom");

    expect(painel).toBeInstanceOf(HTMLElement);

    if (!(painel instanceof HTMLElement)) {
      throw new Error("Painel visual do alerta não encontrado.");
    }

    expect(painel).toHaveAttribute("data-size", "sm");

    expect(painel).toHaveClass("alerta-custom");
  });

  it("não altera o estado do diálogo de confirmação durante o carregamento", () => {
    const onOpenChange = vi.fn();

    render(
      <ConfirmDialog
        open
        loading
        title="Excluir empresa"
        confirmLabel="Excluir"
        onConfirm={vi.fn()}
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Fechar" })).toBeDisabled();
  });

  it("confirma e fecha o diálogo quando não está carregando", () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open
        title="Excluir empresa"
        description="Esta ação não poderá ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Voltar"
        size="lg"
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(
      screen.getByText("Esta ação não poderá ser desfeita."),
    ).toBeInTheDocument();
  });
});
