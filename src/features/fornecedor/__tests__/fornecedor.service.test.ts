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
});
