import { motion, useReducedMotion } from "framer-motion";
import OptimizedImage from "@/components/OptimizedImage";
import { diagnosis, homeVisit, includes, maintenance, others, repairs, warranty } from "@/data/catalog";
import { openQuote, waLink } from "@/lib/site";
import { rogSaving, rogSeparate, servicePages } from "@/data/pages";

// Página de servicio de cada tipo de equipo (enlaces internos para Google).
const PAGE: Record<string, string> = Object.fromEntries(
  servicePages.filter((p) => p.quote !== "reparacion" && p.slug !== "mantenimiento-asus-rog").map((p) => [p.quote, p.slug]),
);

import laptopImg from "../images/services/servicio-laptop.webp";
import pcImg from "../images/services/servicio-pc.webp";
import gpuImg from "../images/services/servicio-gpu.webp";
import macbookImg from "../images/services/servicio-macbook.webp";
import consoleImg from "../images/services/servicio-consola.webp";
import gpuRepairImg from "../images/repair/gpu-repair.webp";
import laptopGamerRepairImg from "../images/repair/laptopgamer-repair.webp";
import laptopOfficeRepairImg from "../images/repair/laptopoffice-repair.webp";

const IMG: Record<string, string> = { laptops: laptopImg, pcs: pcImg, gpus: gpuImg, macbook: macbookImg, consolas: consoleImg };
const REPAIR_IMG: Record<string, string> = { gpu: gpuRepairImg, "laptop-gamer": laptopGamerRepairImg, "laptop-oficina": laptopOfficeRepairImg };
const PRESS =
  "transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]";
const electronic = diagnosis.find((d) => d.id === "diag-electronico")!;
const rog = maintenance.find((c) => c.id === "laptops")!.services.find((s) => s.id === "asus-rog")!;

const ServicesSection = () => {
  const reduce = useReducedMotion();
  const rise = (i = 0) => ({
    initial: { opacity: 0, transform: reduce ? "none" : "translateY(24px)" },
    whileInView: { opacity: 1, transform: "translateY(0px)" },
    viewport: { once: true, amount: 0.15 },
    transition: { type: "spring" as const, bounce: 0, duration: 0.7, delay: i * 0.07 },
  });

  return (
    <section id="servicios" className="bg-[#0b0b0b] py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <motion.h2 {...rise()} className="text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-white md:text-7xl">
          Servicios y precios
        </motion.h2>
        <motion.p {...rise(1)} className="mt-5 max-w-[52ch] text-lg text-white/80">
          Precios fijos por tipo de equipo. Elige el tuyo y el cotizador te arma el total con los extras.
        </motion.p>

        {/* Oferta estrella: campo naranja, lo primero de la lista de precios. */}
        <motion.div {...rise(2)} className="mt-14 grid gap-6 rounded-3xl bg-primary p-6 text-black md:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h3 className="text-4xl font-bold leading-[1] tracking-[-0.035em] md:text-5xl">Paquete completo ASUS ROG</h3>
            <p className="mt-4 max-w-[52ch] text-lg">
              Para toda la línea ROG: limpieza profunda, masilla térmica y metal líquido. Materiales por {warranty.rogMaterialsYears} años y {warranty.thermalMonths} meses de garantía.
            </p>
          </div>
          <div className="lg:text-right">
            <p className="flex items-end gap-3 lg:justify-end">
              <span className="font-display text-6xl font-bold tracking-[-0.04em] tabular-nums">S/ {rog.price}</span>
              <s className="pb-1.5 text-2xl text-black/60">S/ {rogSeparate}</s>
            </p>
            <p className="font-medium">Ahorras S/ {rogSaving}</p>
            <button
              type="button"
              onClick={() => openQuote("laptops")}
              className="mt-5 rounded-full bg-black px-7 py-4 text-lg text-white transition-transform duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Cotizar mi ROG
            </button>
            <a href="/mantenimiento-asus-rog/" className="ml-5 font-medium underline underline-offset-4">
              Ver qué incluye
            </a>
          </div>
        </motion.div>

        <ul className="mt-3 space-y-3">
          {maintenance.map((c, i) => {
            const from = Math.min(...c.services.map((s) => s.price));
            return (
              <motion.li key={c.id} {...rise(i)} className="group grid overflow-hidden rounded-3xl bg-white/[0.04] md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)_auto] md:items-center">
                <div className="aspect-[4/3] overflow-hidden md:row-span-2 md:aspect-auto md:h-full lg:row-span-1">
                  <OptimizedImage
                    src={IMG[c.id]}
                    alt={`Mantenimiento de ${c.name.toLowerCase()} en QuickFix`}
                    width={560}
                    height={400}
                    sizes="(max-width: 768px) 92vw, 280px"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="text-3xl font-bold tracking-[-0.03em] text-white">
                    <a href={`/${PAGE[c.id]}/`} className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                      {c.name}
                    </a>
                  </h3>
                  <p className="mt-3 max-w-[60ch] text-white/70">{includes[c.id].join(" · ")}</p>
                </div>
                <div className="flex items-center justify-between gap-6 px-6 pb-6 md:px-8 lg:flex-col lg:items-end lg:p-8">
                  <p className="text-white/60">
                    desde <span className="font-display block text-4xl font-bold tracking-[-0.03em] text-white tabular-nums">S/ {from}</span>
                  </p>
                  <button type="button" onClick={() => openQuote(c.id)} className={`${PRESS} rounded-full bg-primary px-6 py-3 font-medium text-black hover:bg-[#ff7a1f]`}>
                    Cotizar
                  </button>
                </div>
              </motion.li>
            );
          })}
        </ul>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-3xl bg-white/[0.04] p-6 md:p-8">
            <p className="font-display text-4xl font-bold tracking-[-0.03em] text-primary">{warranty.thermalMonths} meses</p>
            <p className="mt-2 text-lg text-white">de garantía térmica en todos los mantenimientos</p>
            <p className="mt-1 text-white/60">Materiales por {warranty.rogMaterialsYears} años en el paquete ASUS ROG con metal líquido.</p>
            <a href="/garantia/" className="mt-3 inline-block text-primary underline underline-offset-4">Ver la garantía completa</a>
          </div>
          <div className="rounded-3xl bg-white/[0.04] p-6 md:p-8">
            <p className="font-display text-4xl font-bold tracking-[-0.03em] text-white">
              S/ {homeVisit.fee} <span className="text-2xl text-white/60">+ movilidad</span>
            </p>
            <p className="mt-2 text-lg text-white">a domicilio en Lima</p>
            <p className="mt-1 text-white/60">
              Movilidad de S/ {Math.min(...homeVisit.zones.map((z) => z.price))} a S/ {Math.max(...homeVisit.zones.map((z) => z.price))} según tu distrito. ¿Solo quieres que lo recoja? Pagas únicamente la movilidad (no aplica a PC de escritorio).
            </p>
          </div>
        </div>

        <div className="mt-28 md:mt-36 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <motion.h3 {...rise()} className="text-4xl font-bold leading-[1] tracking-[-0.035em] text-white md:text-6xl">
              Reparación a nivel de placa
            </motion.h3>
            <motion.p {...rise(1)} className="mt-5 max-w-[46ch] text-lg text-white/80">
              Microsoldadura para equipos que no encienden, se apagan o recibieron líquido. Empieza con un diagnóstico electrónico de S/ {electronic.price} (1 a 2 días), que se descuenta si reparas conmigo, y luego te doy el precio exacto.
            </motion.p>
            <motion.button {...rise(2)} type="button" onClick={() => openQuote("reparacion")} className={`${PRESS} mt-8 rounded-full bg-white/[0.08] px-6 py-3.5 text-white hover:bg-white/[0.14]`}>
              Cotizar un diagnóstico
            </motion.button>
            <motion.a {...rise(3)} href="/reparacion-placa-laptop/" className="mt-4 block text-primary underline-offset-4 hover:underline">
              Más sobre reparación de placa
            </motion.a>
          </div>

          <ul className="space-y-10">
            {repairs.map((r, i) => (
              <motion.li key={r.id} {...rise(i)} className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
                <OptimizedImage src={REPAIR_IMG[r.id]} alt={`Reparación de ${r.name.toLowerCase()}`} width={360} height={270} sizes="(max-width: 640px) 92vw, 180px" className="aspect-[4/3] w-full rounded-2xl object-cover" />
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h4 className="text-2xl font-bold tracking-[-0.02em] text-white">{r.name}</h4>
                    <p className="text-white/60">
                      desde <span className="font-display text-2xl font-bold text-white tabular-nums">S/ {r.from}</span>
                    </p>
                  </div>
                  <p className="mt-1 text-white/60">{r.detail} · {r.days}</p>
                  <ul className="mt-3 space-y-1 text-white/80">
                    {r.work.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="mt-28 md:mt-36">
          <motion.h3 {...rise()} className="text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
            También armo y configuro
          </motion.h3>
          <ul className="mt-8 grid gap-3 md:grid-cols-3">
            {others.map((o, i) => (
              <motion.li key={o.name} {...rise(i)}>
                <a
                  href={waLink(`Hola QuickFix, quiero cotizar: ${o.name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${PRESS} flex h-full flex-col rounded-3xl bg-white/[0.04] p-6 hover:bg-white/[0.08] active:scale-[0.99]`}
                >
                  <span className="text-xl font-medium text-white">{o.name}</span>
                  <span className="mt-1 text-white/60">{o.detail}</span>
                  <span className="mt-6 text-white/60">
                    desde <span className="font-display text-3xl font-bold text-white tabular-nums">S/ {o.from}</span>
                  </span>
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
