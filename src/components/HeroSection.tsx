import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import heroBg from "@/images/hero/hero-background.webp";
import OptimizedImage from "@/components/OptimizedImage";
import { reviews } from "@/data/reviews";
import { MAPS_URL, RATING, openQuote, waLink } from "@/lib/site";

const featured = reviews[0];
const PRESS =
  "transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]";

const Stars = ({ className = "w-5 h-5" }: { className?: string }) => (
  <span className="flex gap-0.5" aria-hidden="true">
    {Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`${className} text-primary fill-primary`} />
    ))}
  </span>
);

const HeroSection = () => {
  const reduce = useReducedMotion();
  // Entrada escalonada: título, texto, pruebas, botones (sube 24px con fundido).
  const item = (i: number) => ({
    initial: { opacity: 0, transform: reduce ? "none" : "translateY(24px)" },
    animate: { opacity: 1, transform: "translateY(0px)" },
    transition: { type: "spring" as const, bounce: 0, duration: 0.7, delay: 0.08 + i * 0.08 },
  });

  return (
    <section className="relative bg-[#050505] pt-[72px]">
      <div className="mx-auto grid max-w-7xl lg:min-h-[calc(100svh-72px)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center px-5 pb-12 pt-10 md:px-8 lg:py-16">
          <motion.h1 {...item(0)} className="text-[2.6rem] font-bold leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl xl:text-[5.25rem]">
            Especialista en ASUS&nbsp;ROG
          </motion.h1>

          <motion.p {...item(1)} className="mt-6 max-w-[46ch] text-lg leading-relaxed text-white/80 md:text-xl">
            Laptops gamer y equipos de alta gama: mantenimiento con metal líquido, masilla térmica y reparación de placa. En San Miguel, Lima.
          </motion.p>

          <motion.div {...item(2)} className="mt-10 grid grid-cols-3 gap-4 max-w-xl">
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className={`${PRESS} group rounded-2xl -m-2 p-2 hover:bg-white/[0.05]`}>
              <p className="font-display text-4xl font-bold tracking-[-0.03em] text-white md:text-5xl">{RATING.score}</p>
              <span className="mt-2 block"><Stars className="w-4 h-4" /></span>
              <p className="mt-2 text-sm text-white/70 group-hover:text-white">{RATING.count} reseñas en Google</p>
            </a>
            <div>
              <p className="font-display text-4xl font-bold tracking-[-0.03em] text-white md:text-5xl">24/7</p>
              <p className="mt-3 text-sm text-white/70">Todos los días, con cita previa</p>
            </div>
            <div>
              <p className="font-display text-4xl font-bold tracking-[-0.03em] text-primary md:text-5xl">ROG</p>
              <p className="mt-3 text-sm text-white/70">Strix, Zephyrus, SCAR y gama alta</p>
            </div>
          </motion.div>

          <motion.div {...item(3)} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => openQuote()} className={`${PRESS} rounded-full bg-primary px-8 py-4 text-lg font-medium text-black hover:bg-[#ff7a1f]`}>
              Cotizar mi equipo
            </button>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className={`${PRESS} rounded-full bg-white/[0.08] px-8 py-4 text-center text-lg text-white hover:bg-white/[0.14]`}>
              Escribir por WhatsApp
            </a>
          </motion.div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden lg:min-h-0">
          <OptimizedImage
            src={heroBg}
            alt="Placa de una laptop gamer durante un mantenimiento en QuickFix"
            width={1920}
            height={1080}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="absolute inset-0 h-full w-full object-cover motion-safe:animate-[heroDrift_18s_ease-in-out_infinite_alternate]"
          />
          {/* Velo neutro para que la reseña se lea sobre la foto. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" /> {/* taste-skill-ignore: velo neutro bajo la reseña sobre la foto */}
          <motion.figure
            initial={{ opacity: 0, transform: reduce ? "none" : "translateY(24px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ type: "spring", bounce: 0, duration: 0.8, delay: 0.45 }}
            className="absolute inset-x-5 bottom-5 rounded-3xl bg-[#0d0d0d] p-6 md:inset-x-8 md:bottom-8 md:p-7"
          >
            <Stars className="w-4 h-4" />
            <blockquote className="mt-4 text-lg leading-snug text-white md:text-xl">
              “Me solucionaron todo en exactamente 1 hora. El técnico me grabó videos y me mandó fotos paso a paso.”
            </blockquote>
            <figcaption className="mt-4 text-white/60">
              {featured.author} · {featured.device}
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
