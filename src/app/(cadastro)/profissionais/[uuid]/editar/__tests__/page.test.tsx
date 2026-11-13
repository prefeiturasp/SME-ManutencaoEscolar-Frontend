import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { profissionalFormMock } = vi.hoisted(() => ({
  profissionalFormMock: vi.fn(),
}));

vi.mock("@/features/profissional/components/form/ProfissionalForm", () => ({
  ProfissionalForm: (props: { uuid?: string }) => {
    profissionalFormMock(props);
    return <div>Profissional form</div>;
  },
}));

import EditarProfissionalPage from "../page";

describe("EditarProfissionalPage", () => {
  it("deve renderizar o breadcrumb e o formulário com o uuid da rota", async () => {
    const jsx = await EditarProfissionalPage({
      params: Promise.resolve({ uuid: "uuid-1" }),
    });

    render(jsx);

    expect(screen.getByText(/profissional form/i)).toBeInTheDocument();
    expect(profissionalFormMock).toHaveBeenCalledWith({ uuid: "uuid-1" });
  });
});
