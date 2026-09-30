import { useQuery } from "@tanstack/react-query";
import { buscarProfissionalPorUuid } from "../services/profissional.service";

export function useProfissional(uuid: string) {
  return useQuery({
    queryKey: ["profissional", uuid],
    queryFn: () => buscarProfissionalPorUuid(uuid),
    enabled: Boolean(uuid),
    refetchOnWindowFocus: false,
  });
}
