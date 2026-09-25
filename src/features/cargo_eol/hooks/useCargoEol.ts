"use client";

import { useQuery } from "@tanstack/react-query";
import { listarTodosCargosEolAction } from "../services/cargoEol.service";

export function useTodosCargosEol() {
  return useQuery({
    queryKey: ["cargos-eol", "todos"],
    queryFn: listarTodosCargosEolAction,
    refetchOnWindowFocus: false,
  });
}
