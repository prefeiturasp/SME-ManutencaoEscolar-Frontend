import { describe, it, expect, vi, beforeEach } from "vitest";
import { fornecedorService } from "@/features/fornecedor/services/fornecedor.service";
import { api } from "@/actions/http/client";

vi.mock("@/actions/http/client", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockApi = api as any;

describe("fornecedorService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("deve chamar api.post com endpoint correto", async () => {
      const payload = {
        nome: "Empresa",
        cnpj: "11444777000161",
        status: true,
        razao_social: "Empresa LTDA",
        link_rastreio: "https://example.com",
        cep: "01310100",
        logradouro: "Rua",
        numero: "123",
        complemento: "",
        cidade: "São Paulo",
        estado: "SP",
      };

      mockApi.post.mockResolvedValue({ data: { id: "1", ...payload } });

      await fornecedorService.create(payload);

      expect(mockApi.post).toHaveBeenCalledWith("/fornecedores", payload);
    });
  });

  describe("list", () => {
    it("deve chamar api.get com endpoint e parâmetros corretos", async () => {
      const params = {
        nome: "Empresa",
        status: "true",
        page: 1,
        page_size: 10,
      };

      const response = { count: 0, next: null, previous: null, results: [] };

      mockApi.get.mockResolvedValue({ data: response });

      const result = await fornecedorService.list(params);

      expect(mockApi.get).toHaveBeenCalledWith("/fornecedores", { params });
      expect(result).toEqual(response);
    });
  });
});
