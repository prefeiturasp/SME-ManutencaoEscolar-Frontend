import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import LoginPage from "../page";

vi.mock("@/features/login/components/LoginForm/LoginForm", () => ({
  LoginForm: () => <div>Login Form</div>,
}));

describe("LoginPage", () => {
  it("deve renderizar o LoginForm", () => {
    render(<LoginPage />);

    expect(screen.getByText("Login Form")).toBeInTheDocument();
  });
});
