import { describe, expect, it, vi } from "vitest";

import { useMutation } from "@tanstack/react-query";
import { useLogin } from "../hooks/useLogin";
import { loginAction } from "../services/login.api";

vi.mock("../services/login.api", () => ({
  loginAction: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
}));

describe("useLogin", () => {
  it("deve configurar a mutation com loginAction", () => {
    vi.mocked(useMutation).mockReturnValue(
      {} as ReturnType<typeof useMutation>,
    );

    useLogin();

    expect(useMutation).toHaveBeenCalledWith({
      mutationFn: loginAction,
    });
  });
});

vi.mock("../services/login.api", () => ({
  loginAction: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
}));

describe("useLogin", () => {
  it("deve configurar a mutation com loginAction", () => {
    vi.mocked(useMutation).mockReturnValue(
      {} as ReturnType<typeof useMutation>,
    );

    useLogin();

    expect(useMutation).toHaveBeenCalledWith({
      mutationFn: loginAction,
    });
  });
});
