"use client";

import { ErrorCircleIcon } from "@/components/icons/Close";
import { SuccessCircleIcon } from "@/components/icons/SimboloAprovado";
import { Button } from "@/components/ui/button";

import { PencilIcon } from "@/components/icons/PincelCustom";
import { Paginacao } from "@/components/navigation/paginacao/Paginacao";
import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useListarServicos } from "../../hooks/useListarServico";
import { FiltrosServico, StatusFiltro } from "../../types/servicos.types";

export function ListarServico() {
  const [nome, setNome] = useState("");
  const [status, setStatus] = useState<StatusFiltro>("");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosServico>({
    page: 1,
    page_size: 10,
  });

  const { data } = useListarServicos(filtrosAplicados);

  const servicos = data?.results ?? [];
  const totalRegistros = data?.count ?? 0;

  function handleMudarPagina(novaPagina: number) {
    setPaginaAtual(novaPagina);

    setFiltrosAplicados((filtrosAtuais) => ({
      ...filtrosAtuais,
      page: novaPagina,
      page_size: registrosPorPagina,
    }));
  }

  function handleMudarRegistrosPorPagina(quantidade: number) {
    setRegistrosPorPagina(quantidade);
    setPaginaAtual(1);

    setFiltrosAplicados((filtrosAtuais) => ({
      ...filtrosAtuais,
      page: 1,
      page_size: quantidade,
    }));
  }

  function handleBuscar() {
    let statusFiltro: boolean | undefined;

    if (status === "ativo") {
      statusFiltro = true;
    } else if (status === "inativo") {
      statusFiltro = false;
    }

    setPaginaAtual(1);

    setFiltrosAplicados({
      nome: nome.trim() || undefined,
      status: statusFiltro,
      page: 1,
      page_size: registrosPorPagina,
    });
  }

  function handleLimparFiltros() {
    setNome("");
    setStatus("");
    setPaginaAtual(1);

    setFiltrosAplicados({
      page: 1,
      page_size: registrosPorPagina,
    });
  }

  const possuiFiltro = nome.trim() !== "" || status !== "";

  return (
    <div className="flex flex-col gap-8 ml-1">
      <section className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <label htmlFor="nome" className="text-sm font-bold text-gray">
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
            <label htmlFor="status" className="text-sm font-bold text-gray">
              Status
            </label>

            <Select
              value={status}
              onValueChange={(value) => {
                if (value === "ativo" || value === "inativo") {
                  setStatus(value);
                }
              }}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>

              <SelectContent position="popper" align="start" sideOffset={0}>
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
            className="max-w-[117px]"
          >
            Limpar filtros
          </Button>

          <Button
            type="button"
            variant="outline"
            size="big-lg"
            disabled={!possuiFiltro}
            className={
              possuiFiltro
                ? "max-w-[165px]"
                : "text-blocked-foreground border-blocked-foreground max-w-[165px]"
            }
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

        {totalRegistros === 0 ? (
          <ListaVazio
            titulo="Não há serviços cadastrados"
            descricao="Que tal cadastrar o primeiro serviço agora?"
            textoBotao="Cadastrar serviço"
            href="/cadastro/servicos/cadastrar"
          />
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full border-collapse text-sm">
              <thead className="border-b px-4 py-3 bg-[var(--tr-color)] ">
                <tr>
                  <th className="border-b px-4 py-3 text-left font-bold">
                    Serviço
                  </th>

                  <th className="w-23.5 border-b border-l px-4 py-3 text-left font-bold">
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
                  <tr
                    key={servico.uuid}
                    className={
                      servico.status
                        ? ""
                        : "bg-gray-light text-blocked-foreground"
                    }
                  >
                    <td
                      className={
                        servico.status
                          ? "border-b px-4 py-3 text-gray"
                          : "border-b px-4 py-3 bg-gray-light text-blocked-foreground"
                      }
                    >
                      {servico.nome}
                    </td>

                    <td
                      className={
                        servico.status
                          ? "border-b text-gray border-b border-l px-2"
                          : "border-b bg-gray-light text-blocked-foreground border-b border-l px-2"
                      }
                    >
                      <div className="flex items-center gap-1 text-gray">
                        {servico.status ? (
                          <SuccessCircleIcon className="size-4 text-[#8DC773]" />
                        ) : (
                          <ErrorCircleIcon className="size-4 text-[#FD756D]" />
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
                        className="border border-primary-dark"
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Paginacao
        paginaAtual={paginaAtual}
        totalRegistros={totalRegistros}
        registrosPorPagina={registrosPorPagina}
        onMudarPagina={handleMudarPagina}
        onMudarRegistrosPorPagina={handleMudarRegistrosPorPagina}
      />
    </div>
  );
}
