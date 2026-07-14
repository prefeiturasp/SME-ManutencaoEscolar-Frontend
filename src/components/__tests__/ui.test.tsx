import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlusIcon } from "@/components/icons/plus";
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

    for (const variant of ["outline", "secondary", "ghost", "destructive", "link"] as const) {
      rerender(<Button variant={variant}>{variant}</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-variant", variant);
    }

    for (const size of ["xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"] as const) {
      rerender(<Button size={size}>{size}</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-size", size);
    }

    expect(buttonVariants({ variant: "link", size: "icon" })).toContain("underline-offset-4");
  });

  it("permite que Button repasse suas propriedades para um filho", () => {
    render(
      <Button asChild>
        <a href="/fornecedores">Fornecedores</a>
      </Button>,
    );

    expect(screen.getByRole("link", { name: "Fornecedores" })).toHaveAttribute(
      "href",
      "/fornecedores",
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

    expect(screen.getByText("Título")).toHaveAttribute("data-slot", "card-title");
    expect(screen.getByText("Pequeno")).toHaveAttribute("data-size", "sm");
    expect(screen.getByText("Título").closest("[data-slot=card]")).toHaveClass("card-custom");
  });

  it("renderiza input, label e ícone com as propriedades recebidas", () => {
    render(
      <>
        <Label htmlFor="nome" className="label-custom">Nome</Label>
        <Input id="nome" type="email" className="input-custom" />
        <PlusIcon aria-label="Adicionar" className="icon-custom" />
      </>,
    );

    expect(screen.getByLabelText("Nome")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Nome")).toHaveClass("input-custom");
    expect(screen.getByText("Nome")).toHaveClass("label-custom");
    expect(screen.getByLabelText("Adicionar")).toHaveClass("icon-custom");
  });

  it("renderiza tabela e todos os seus elementos estruturais", () => {
    render(
      <Table className="table-custom">
        <TableCaption>Fornecedores</TableCaption>
        <TableHeader><TableRow><TableHead>Nome</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><TableCell>Escola</TableCell></TableRow></TableBody>
        <TableFooter><TableRow><TableCell>Total</TableCell></TableRow></TableFooter>
      </Table>,
    );

    expect(screen.getByRole("table")).toHaveClass("table-custom");
    expect(screen.getByText("Nome")).toHaveAttribute("data-slot", "table-head");
    expect(screen.getByText("Escola")).toHaveAttribute("data-slot", "table-cell");
    expect(screen.getByText("Fornecedores")).toHaveAttribute("data-slot", "table-caption");
    expect(screen.getByRole("table").parentElement).toHaveAttribute(
      "data-slot",
      "table-container",
    );
  });
});
