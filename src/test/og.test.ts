import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { heads } from "@/lib/seo";

describe("vista previa al compartir", () => {
  it("cada página tiene su imagen en public/og (corre node scripts/og-images.mjs si falta)", () => {
    const missing = heads.map((h) => new URL(h.image).pathname).filter((p) => !fs.existsSync(`public${p}`));
    expect(missing).toEqual([]);
  });
});
