import { maxDrop, results, STRESS_TEST, type Result } from "@/data/results";

/** Una fila CPU o GPU: antes → después y cuántos grados bajó. */
const Reading = ({ label, before, after }: { label: string; before: number; after: number }) => (
  <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-x-4">
    <dt className="text-lg text-white/60">{label}</dt>
    <dd className="font-display flex flex-wrap items-baseline gap-x-3 text-4xl font-bold tracking-[-0.03em] text-white tabular-nums md:text-5xl">
      <span className="text-white/50">{before}°</span>
      <span className="text-white/40" aria-hidden="true">→</span>
      <span className="sr-only">bajó a</span>
      <span>{after}°</span>
      <span className="text-2xl font-semibold text-primary md:text-3xl">−{before - after} °C</span>
    </dd>
  </div>
);

const Photo = ({ src, label, caption }: { src: string; label: string; caption: string }) => (
  <figure>
    <img src={src} alt={label} width={720} height={960} loading="lazy" decoding="async" className="aspect-[3/4] w-full rounded-2xl object-cover" />
    <figcaption className="mt-2 text-white/60">{caption}</figcaption>
  </figure>
);

const Case = ({ r }: { r: Result }) => (
  <li className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
    <div>
      <h3 className="text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">{r.model}</h3>
      <p className="mt-1 text-lg text-white/60">{r.service}</p>
      <dl className="mt-8 space-y-4">
        <Reading label="CPU" before={r.before.cpu} after={r.after.cpu} />
        <Reading label="GPU" before={r.before.gpu} after={r.after.gpu} />
      </dl>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Photo src={r.imageBefore} label={`${r.model} por dentro antes del mantenimiento`} caption="Antes" />
      <Photo src={r.imageAfter} label={`${r.model} por dentro después del mantenimiento`} caption="Después" />
    </div>
  </li>
);

/** Prueba medible: cuánto bajó la temperatura en equipos reales, con la misma prueba de estrés. */
const ResultsSection = () => (
  <section id="resultados" className="bg-[#0b0b0b] py-24 md:py-36">
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <h2 className="text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-white md:text-7xl">Hasta {maxDrop} °C menos, medidos</h2>
      <p className="mt-5 max-w-[56ch] text-lg text-white/80">
        Temperatura al terminar la prueba de estrés {STRESS_TEST}, antes y después del mantenimiento. Las fotos son del interior de cada equipo en mi mesa de trabajo.
      </p>

      <ul className="mt-16 space-y-20 md:space-y-28">
        {results.map((r) => (
          <Case key={r.model} r={r} />
        ))}
      </ul>
    </div>
  </section>
);

export default ResultsSection;
