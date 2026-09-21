import { useQuery } from "@tanstack/react-query";
import { buscarUnidadeEducacionalPorUuid } from "../services/unidadeEducacional.service";

export function useUnidadeEducacional(uuid: string) {
  return useQuery({
    queryKey: ["unidade", uuid],
    queryFn: () => buscarUnidadeEducacionalPorUuid(uuid),
    enabled: Boolean(uuid),
    refetchOnWindowFocus: false,
  });
}
