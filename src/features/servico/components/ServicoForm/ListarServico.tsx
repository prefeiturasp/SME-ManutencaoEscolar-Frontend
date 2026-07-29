"use client";

import { ErrorCircleIcon } from "@/components/icons/Close";
import { SuccessCircleIcon } from "@/components/icons/SimboloAprovado";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { useListarServicos } from "../../hooks/useListarServico";
import { FiltrosServico } from "../../types/servicos.types";

export function ListarServico() {
  const [nome, setNome] = useState("");
  const [status, setStatus] = useState("todos");

  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosServico>({});

  const { data } = useListarServicos(filtrosAplicados);

  const servicos = data ?? [];

  const paginaAtual = 1;
  const totalRegistros = servicos.length;

  function handleBuscar() {
    setFiltrosAplicados({
      nome: nome.trim() || undefined,
      status: status === "todos" ? undefined : status === "ativo",
    });
  }

  function handleLimparFiltros() {
    setNome("");
    setStatus("todos");
    setFiltrosAplicados({});
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <label
              htmlFor="nome"
              className="text-sm font-bold text-[var(--background-gray)]"
            >
              Nome
            </label>

            <Input
              id="nome"
              value={nome}
              placeholder="Digite o nome do serviço..."
              onChange={(event) => {
                setNome(event.target.value);
              }}
            />
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <label
              htmlFor="status"
              className="text-sm font-bold text-[var(--background-gray)]"
            >
              Status
            </label>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>

              <SelectContent position="popper" align="start" sideOffset={0}>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            size="big-lg"
            onClick={handleLimparFiltros}
          >
            Limpar filtros
          </Button>

          <Button
            type="button"
            variant="outline"
            size="big-lg"
            onClick={handleBuscar}
          >
            <Plus className="size-4" />
            Buscar serviços
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-2xl font-bold">Serviços cadastrados</h2>

          <p className="text-lg text-muted-foreground">
            Estes são os serviços que já estão cadastrados no sistema.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="border-b px-4 py-3 text-left font-bold">
                  Serviço
                </th>

                <th className="w-32 border-b border-l px-4 py-3 text-left font-bold">
                  Status
                </th>

                <th
                  className="w-16 border-b border-l px-4 py-3"
                  aria-label="Ações"
                />
              </tr>
            </thead>

            <tbody>
              {servicos.map((servico) => (
                <tr key={servico.uuid}>
                  <td className="border-b px-4 py-3">{servico.nome}</td>

                  <td className="border-b border-l px-4 py-3">
                    <div className="flex items-center gap-1">
                      {servico.status ? (
                        <SuccessCircleIcon
                          className={"size-4 text-green-500"}
                        />
                      ) : (
                        <ErrorCircleIcon className={"size-4 text-red-500"} />
                      )}

                      {servico.status ? "Ativo" : "Inativo"}
                    </div>
                  </td>

                  <td className="border-b border-l px-2 py-2 text-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={`Editar ${servico.nome}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center pt-2">
          <span className="text-sm text-muted-foreground">
            Mostrando 1-{totalRegistros} de {totalRegistros} registro(s)
          </span>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <Button type="button" variant="outline" size="icon">
              {paginaAtual}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled
              aria-label="Próxima página"
            >
              <ChevronRight className="size-4" />
            </Button>

            <Select defaultValue="20">
              <SelectTrigger
                className="w-[80px]"
                aria-label="Registros por página"
              >
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}
