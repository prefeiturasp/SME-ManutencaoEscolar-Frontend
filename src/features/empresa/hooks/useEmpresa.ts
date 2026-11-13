import { useQuery } from "@tanstack/react-query";
import { buscarEmpresaPorUuid } from "../services/empresa.service";

export function useEmpresa(uuid: string) {
  return useQuery({
    queryKey: ["empresa", uuid],
    queryFn: () => buscarEmpresaPorUuid(uuid),
    enabled: Boolean(uuid),
    refetchOnWindowFocus: false,
  });
}
