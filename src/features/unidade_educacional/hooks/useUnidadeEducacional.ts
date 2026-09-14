import { useQuery } from "@tanstack/react-query";
import { buscarUnidadeEducaionalPorUuid } from "../services/unidadeEducacional.service";

export function useUnidadeEducacional(uuid: string) {
  return useQuery({
    queryKey: ["unidade", uuid],
    queryFn: () => buscarUnidadeEducaionalPorUuid(uuid),
    enabled: Boolean(uuid),
    refetchOnWindowFocus: false,
  });
}
