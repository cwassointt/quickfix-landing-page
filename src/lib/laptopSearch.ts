/** Modelo de laptop de src/data/laptops.json; `tier` es el id del servicio en catalog.ts. */
export type Laptop = { brand: string; name: string; code?: string; tier: string };

const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

export const laptopLabel = (l: Laptop) => [l.brand, l.name, l.code].filter(Boolean).join(" ");

/**
 * Busca por código de modelo ("G614JV-AS73" encuentra G614JV) o por palabras ("legion 5 pro").
 * El código manda; las palabras ordenan y desempatan.
 */
export function searchLaptops(list: Laptop[], query: string, limit = 6): Laptop[] {
  const q = compact(query);
  const qWords = words(query);
  if (q.length < 2) return [];

  return list
    .map((l) => {
      const code = compact(l.code ?? "");
      const codeHit = code.length >= 4 && q.includes(code);
      const nameWords = words(`${l.brand} ${l.name}`);
      const codeWords = words(l.code ?? "");
      // El usuario suele escribir el código completo ("b0005la"), así que también vale que empiece por una parte del código.
      const matched = qWords.filter((w) => nameWords.some((h) => h.startsWith(w)) || codeWords.some((h) => h.startsWith(w) || w.startsWith(h))).length;
      const ok = codeHit || matched >= Math.max(1, Math.ceil(qWords.length * 0.6));
      return { l, score: ok ? (codeHit ? 100 + code.length : 0) + matched : -1 };
    })
    .filter((r) => r.score >= 0)
    .sort((a, b) => b.score - a.score || laptopLabel(a.l).length - laptopLabel(b.l).length)
    .slice(0, limit)
    .map((r) => r.l);
}
