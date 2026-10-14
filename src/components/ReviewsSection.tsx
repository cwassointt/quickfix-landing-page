import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { reviews } from "@/data/reviews";
import { MAPS_URL, RATING } from "@/lib/site";

// La de Jak Steve ya está en el hero; aquí la estrella es la de James.
const featured = reviews.find((r) => r.author === "James Maysundo")!;
const rest = reviews.filter((r) => r !== featured && r !== reviews[0]);

const Stars = () => (
  <span className="flex gap-0.5" role="img" aria-label="5 de 5 estrellas">
    {Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className="w-4 h-4 text-primary fill-primary" aria-hidden="true" />
    ))}
  </span>
);

const ReviewsSection = () => {
  const reduce = useReducedMotion();
  const rise = (i: number) => ({
    initial: { opacity: 0, transform: reduce ? "none" : "translateY(24px)" },
    whileInView: { opacity: 1, transform: "translateY(0px)" },
    viewport: { once: true, amount: 0.2 },
    transition: { type: "spring" as const, bounce: 0, duration: 0.7, delay: i * 0.07 },
  });

  return (
    <section id="resenas" className="bg-[#0b0b0b] py-24 md:py-36">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <motion.h2 {...rise(0)} className="text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-white md:text-7xl">
            {RATING.score} en Google, {RATING.count} reseñas
          </motion.h2>
          <motion.figure {...rise(1)} className="mt-10">
            <Stars />
            <blockquote className="mt-5 text-2xl leading-snug text-white md:text-[2rem] md:leading-[1.2]">
              “En Gianluca confío ciegamente: profesional, detallista y con materiales de primera.”
            </blockquote>
            <figcaption className="mt-5 text-white/60">
              {featured.author} · Local Guide en Google
            </figcaption>
          </motion.figure>
          <motion.a
            {...rise(2)}
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex rounded-full bg-white/[0.08] px-6 py-3.5 text-white transition-colors duration-150 hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Ver todas en Google Maps
          </motion.a>
        </div>

        <ul className="columns-1 gap-4 sm:columns-2 [&>li]:mb-4">
          {rest.map((r, i) => (
            <motion.li key={r.author} {...rise(i)} className="break-inside-avoid rounded-3xl bg-white/[0.04] p-6">
              <Stars />
              <p className="mt-4 text-[17px] leading-relaxed text-white">“{r.text}”</p>
              <p className="mt-5 text-white/60">
                <span className="text-white">{r.author}</span>
                {r.device && <> · {r.device}</>}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ReviewsSection;
