"use client";

import { useEffect, useState } from "react";
import { healthAction } from "@/actions/api/health";

export function useHealth() {
  const [healthStatus, setHealthStatus] = useState("Carregando...");

  useEffect(() => {
    async function loadHealth() {
      const status = await healthAction();
      setHealthStatus(status);
    }

    loadHealth();
  }, []);

  return healthStatus;
}