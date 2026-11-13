import { describe, expect, it } from "vitest";

import { cn } from "../utils";

describe("cn", () => {
  it("combina classes condicionais e resolve conflitos do Tailwind", () => {
    expect(cn("px-2", false, "px-4", { hidden: true })).toBe("px-4 hidden");
  });
});
