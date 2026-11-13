import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock(
  "@/features/login/components/RecuperarSenhaForm/RecuperarSenhaForm",
  () => ({
    RecuperarSenhaForm: () => <div>Recuperar senha</div>,
  }),
);

import RecuperarSenhaPage from "../page";

describe("RecuperarSenhaPage", () => {
  it("deve renderizar o formulário", () => {
    render(<RecuperarSenhaPage />);

    expect(screen.getByText("Recuperar senha")).toBeInTheDocument();
  });
});
