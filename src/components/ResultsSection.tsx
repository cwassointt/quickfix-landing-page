import MockImage from "@/components/MockImage";
import { results, type Result } from "@/data/results";

const Shot = ({ src, label }: { src?: string; label: string }) =>
  src ? (
    <img src={src} alt={label} width={600} height={400} loading="lazy" className="aspect-[3/2] w-full rounded-2xl object-cover" />
  ) : (
    <MockImage label={label} className="aspect-[3/2] w-full rounded-2xl" />
  );

const Temps = ({ r }: { r: Result }) =>
  r.before !== undefined && r.after !== undefined ? (
    <p className="font-display text-4xl font-bold tracking-[-0.03em] text-white tabular-nums">
      {r.before} °C <span className="text-white/50">→</span> <span className="text-primary">{r.after} °C</span>
      <span className="ml-3 align-middle text-xl font-medium text-primary">−{r.before - r.after} °C</span>
    </p>
  ) : (
    <p className="text-lg text-white/60">Temperaturas pendientes</p>
  );

/** Prueba medible: cuánto bajó la temperatura en equipos reales. */
const ResultsSection = () => (
  <section id="resultados" className="bg-[#050505] py-24 md:py-36">
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <h2 className="text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-white md:text-7xl">Grados menos, medidos</h2>
      <p className="mt-5 max-w-[52ch] text-lg text-white/80">Capturas reales de temperatura en carga, antes y después del mantenimiento.</p>

      <ul className="mt-14 space-y-14">
        {results.map((r) => (
          <li key={r.model} className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <h3 className="text-3xl font-bold tracking-[-0.03em] text-white">{r.model}</h3>
              <p className="mt-1 text-white/60">{r.service}</p>
              <div className="mt-5">
                <Temps r={r} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <figure>
                <Shot src={r.imageBefore} label={`${r.model}: captura antes`} />
                <figcaption className="mt-2 text-white/60">Antes</figcaption>
              </figure>
              <figure>
                <Shot src={r.imageAfter} label={`${r.model}: captura después`} />
                <figcaption className="mt-2 text-white/60">Después</figcaption>
              </figure>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default ResultsSection;
