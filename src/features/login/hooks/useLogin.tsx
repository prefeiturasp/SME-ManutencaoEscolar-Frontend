"use client";

import { useMutation } from "@tanstack/react-query";

import { loginAction } from "../services/login.api";

export function useLogin() {
  return useMutation({
    mutationFn: loginAction,
  });
}
