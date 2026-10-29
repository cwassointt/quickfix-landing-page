import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { reviews } from "@/data/reviews";
import ReviewAvatar from "@/components/ReviewAvatar";
import { MAPS_URL, RATING } from "@/lib/site";
import { useAutoScroll } from "@/lib/useAutoScroll";

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
  const track = useAutoScroll<HTMLUListElement>();
  const rise = (i: number) => ({
    initial: { opacity: 0, transform: reduce ? "none" : "translateY(24px)" },
    whileInView: { opacity: 1, transform: "translateY(0px)" },
    viewport: { once: true, amount: 0.2 },
    transition: { type: "spring" as const, bounce: 0, duration: 0.7, delay: i * 0.07 },
  });

  return (
    <section id="resenas" className="bg-[#0b0b0b] section">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <motion.h2 {...rise(0)} className="section-title">
            {RATING.score} en Google, {RATING.count} reseñas
          </motion.h2>
          <motion.figure {...rise(1)} className="mt-10">
            <Stars />
            <blockquote className="mt-5 text-2xl leading-snug text-white md:text-3xl md:leading-[1.2]">
              “En Gianluca confío ciegamente: profesional, detallista y con materiales de primera.”
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3 text-white/60">
              <ReviewAvatar name={featured.author} photo={featured.photo} size={44} />
              <span>
                <span className="block text-white">{featured.author}</span>
                Local Guide en Google
              </span>
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

        {/* Móvil: carrusel horizontal que avanza solo. Desde sm: dos columnas. */}
        <ul ref={track} className="-mx-5 flex min-w-0 snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:block sm:columns-2 sm:overflow-visible sm:px-0 sm:[&>li]:mb-4">
          {rest.map((r, i) => (
            <motion.li key={r.author} {...rise(i)} className="w-[85%] shrink-0 snap-start break-inside-avoid rounded-3xl bg-white/[0.04] p-6 sm:w-auto">
              <Stars />
              <p className="mt-4 text-base leading-relaxed text-white">“{r.text}”</p>
              <p className="mt-5 flex items-center gap-3 text-white/60">
                <ReviewAvatar name={r.author} photo={r.photo} />
                <span className="min-w-0">
                  <span className="block text-white">{r.author}</span>
                  {r.device}
                </span>
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ReviewsSection;
