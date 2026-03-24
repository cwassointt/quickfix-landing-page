import React, { memo } from "react";
import { ArrowRight, MessageCircle, Star, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/images/hero/hero-background.webp";
import OptimizedImage from "@/components/OptimizedImage";

const WHATSAPP_URL = "https://wa.me/51940755119?text=Hola%20QuickFix%2C%20deseo%20agendar%20una%20cita%20para%20el%20mantenimiento%20de%20mi%20equipo.";
const MAPS_REVIEWS_URL = "https://www.google.com/maps/place/QuickFix.pe/@-12.078675,-77.1128235,17z/data=!3m1!4b1!4m6!3m5!1s0x9105cba106bb0ffd:0x56720d8b1b55c23e!8m2!3d-12.0786803!4d-77.1102486!16s%2Fg%2F11xyxywtk7!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D";

const NUM_PARTICLES = 18;

// ── Static particle config — computed once, never re-randomised ───
const PARTICLE_CONFIG = Array.from({ length: NUM_PARTICLES }, (_, i) => ({
  id: i,
  x: Math.random() * 45,
  size: Math.random() * 3 + 1.5,
  duration: Math.random() * 8 + 7,
  delay: Math.random() * -12,
  opacity: Math.random() * 0.35 + 0.1,
  xDrift: (Math.random() - 0.5) * 40,
}));

const EnergyParticles = memo(() => (
  <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden md:w-[45%]">
    {PARTICLE_CONFIG.map((p) => (
      <motion.span
        key={p.id}
        className="absolute rounded-full bg-orange-500"
        style={{ left: `${p.x}%`, bottom: "-10px", width: p.size, height: p.size, opacity: p.opacity }}
        animate={{ y: [0, -900], opacity: [p.opacity, p.opacity * 0.5, 0], x: [0, p.xDrift] }}
        transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
      />
    ))}
  </div>
));

// ── Static variants outside component ────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.22, delayChildren: 0.15 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// ── ShimmerText — Optimized to avoid non-composited animations (Lighthouse fix) ────────────
const _shimmerStyle = `
  @keyframes shimmerPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  .shimmer-text {
    background-image: linear-gradient(90deg, #fb923c 0%, #fed7aa 50%, #fb923c 100%);
    background-size: 100% auto;
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    animation: shimmerPulse 3s ease-in-out infinite;
    will-change: opacity;
  }
`;

const _goldShimmerStyle = `
  @keyframes goldPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  .shimmer-gold {
    background-image: linear-gradient(90deg, #FBBF24 0%, #FFFFFF 50%, #FBBF24 100%);
    background-size: 100% auto;
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    animation: goldPulse 3.5s ease-in-out infinite;
    will-change: opacity;
  }
`;

if (typeof document !== "undefined") {
  if (!document.getElementById("shimmer-text-style")) {
    const el = document.createElement("style");
    el.id = "shimmer-text-style";
    el.textContent = _shimmerStyle;
    document.head.appendChild(el);
  }
  if (!document.getElementById("gold-shimmer-style")) {
    const el = document.createElement("style");
    el.id = "gold-shimmer-style";
    el.textContent = _goldShimmerStyle;
    document.head.appendChild(el);
  }
}

const ShimmerText = memo(({ children }: { children: React.ReactNode }) => (
  <span className="shimmer-text">{children}</span>
));

// ── FloatingStat — memoized ───────────────────────────────────────
const FloatingStat = memo(({ value, label, delay }: { value: string; label: string; delay: number }) => (
  <motion.div
    className="group cursor-default opacity-80 hover:opacity-100 transition-opacity duration-300"
    animate={{ y: [0, -3, 0, 3, 0] }}
    transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, delay }}
    whileHover={{ scale: 1.05 }}
  >
    <p className="text-3xl font-black text-white group-hover:text-orange-500 transition-colors duration-300" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
      {value}
    </p>
    <p className="text-[10px] md:text-xs text-white/40 uppercase tracking-[0.2em] mt-2 font-bold group-hover:text-white/60 transition-colors" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
      {label}
    </p>
  </motion.div>
));

// ── Static stats config ───────────────────────────────────────────
const STATS = [
  { value: "24h",     label: "Disponibilidad", delay: 0   },
  { value: "+140",    label: "Reseñas 5★",     delay: 1.5 },
  { value: "Premium", label: "Insumos",         delay: 3   },
] as const;

// ── Stars array computed once ─────────────────────────────────────
const STARS = Array.from({ length: 5 }, (_, i) => i);

// ── Hero image scale — pure CSS to avoid framer-motion blocking LCP ──
const _heroStyle = `
  @keyframes heroScale {
    0%, 100% { transform: scale(1);    }
    50%       { transform: scale(1.05); }
  }
  .hero-scale { animation: heroScale 10s ease-in-out infinite; }
`;
if (typeof document !== "undefined" && !document.getElementById("hero-scale-style")) {
  const el = document.createElement("style");
  el.id = "hero-scale-style";
  el.textContent = _heroStyle;
  document.head.appendChild(el);
}

const HeroSection = () => {
    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const targetId = href.replace(/.*#/, "");
        const elem = document.getElementById(targetId);

        if (elem) {
            elem.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
      <section className="relative min-h-screen bg-black flex flex-col overflow-hidden">
        <EnergyParticles />
        <div className="absolute inset-0 z-0 bg-black">
          <div className="absolute inset-x-0 bottom-0 top-0 md:left-[35%] md:right-0 bg-black overflow-hidden" style={{ clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)" }}>
            <div className="absolute inset-0">
              <OptimizedImage
                src={heroBg}
                alt="Mantenimiento de PC Gamer y Laptops High-End en Lima - QuickFix"
                width={1920}
                priority={true}
                className="hero-scale w-full h-full object-cover object-center opacity-80"
                height={1080}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-90" />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 md:hidden bg-black/70 z-0" />

        <div className="relative z-10 flex-1 flex items-center px-6 md:px-16 lg:px-24 xl:px-32 pt-28 pb-10">
          <div className="w-full max-w-[650px]">
            <motion.div
              className="absolute -top-10 -left-10 md:-left-20 text-[6rem] md:text-[10rem] font-black text-white/[0.03] select-none pointer-events-none z-0 tracking-tighter leading-none"
              style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 8, ease: "easeInOut", repeat: Infinity, delay: 1 }}
            >
              QUICKFIX
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10">
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-7 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                <span className="text-orange-500 text-xs font-bold tracking-[0.1em] uppercase" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                  Abierto 24h (Previa Cita) — San Miguel, Lima
                </span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-4xl md:text-5xl lg:text-[3.8rem] xl:text-[4.2rem] font-black text-white leading-[1.05] mb-6 tracking-tight"
                style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
              >
                Mantenimiento con{" "}
                <ShimmerText>Metal Líquido</ShimmerText>{" "}
                y <span className="shimmer-gold">Reparación</span> Electrónica en Lima, Perú
              </motion.h1>

              <motion.p variants={itemVariants} className="text-white/70 text-base md:text-lg leading-relaxed mb-10 max-w-[520px] font-light" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                Especialista en equipos ASUS ROG con tecnología de Metal Líquido, Laptops High-End y Computadoras de Gama Alta. Recuperamos el rendimiento extremo de tu máquina con procesos de laboratorio.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative overflow-hidden inline-flex items-center justify-center gap-3 bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 shadow-[0_10px_30px_-5px_rgba(249,115,22,0.4)] hover:shadow-[0_20px_40px_-10px_rgba(249,115,22,0.6)] hover:-translate-y-1 group"
                  style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  <MessageCircle className="w-5 h-5 relative z-10" />
                  <span className="relative z-10 text-white font-black drop-shadow-md">Agenda tu mantenimiento</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 relative z-10" />
                </a>
                <a
                  href="#servicios"
                  onClick={(e) => handleScroll(e, '#servicios')}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/20 hover:border-white/40 text-white/90 hover:text-white font-semibold text-base transition-all duration-300 hover:bg-white/5 backdrop-blur-sm hover:-translate-y-1 cursor-pointer"
                  style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
                >
                  Ver servicios y precios
                </a>
              </motion.div>

              <motion.div variants={itemVariants} className="flex gap-8 md:gap-14 mt-14 pt-8 border-t border-white/10">
                {STATS.map((stat) => <FloatingStat key={stat.label} {...stat} />)}
              </motion.div>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="relative z-20 w-full mt-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 1.3 }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
          <a
            href={MAPS_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 px-8 py-6 bg-black/80 backdrop-blur-xl border-t border-white/5 hover:bg-black/90 transition-all duration-300"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-900/10 border border-orange-500/30 shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.15)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] group-hover:-translate-y-1">
              <Trophy className="w-6 h-6 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
            </div>
            <div className="hidden md:block w-px h-8 bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-white tracking-tighter group-hover:text-orange-400 transition-colors duration-300" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>5.0</span>
              <div className="flex gap-0.5">
                {STARS.map((i) => (
                  <Star key={i} className="w-5 h-5 text-orange-500 fill-orange-500 transition-transform duration-200 group-hover:scale-125" style={{ transitionDelay: `${i * 50}ms` }} />
                ))}
              </div>
            </div>
            <div className="hidden md:block w-px h-8 bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />
            <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
              <span className="text-2xl md:text-3xl font-black text-white leading-none group-hover:text-orange-100 transition-colors duration-300" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>+140</span>
              <span className="text-sm text-white/60 font-medium group-hover:text-white/80 transition-colors duration-300" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>reseñas verificadas en Google</span>
            </div>
            <div className="hidden md:block w-px h-8 bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="relative flex h-2.5 w-2.5">
                  <motion.span className="absolute inline-flex h-full w-full rounded-full bg-green-500" animate={{ scale: [1, 1.8, 1], opacity: [0.9, 0, 0.9] }} transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }} />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <span className="text-white/90 text-sm font-bold tracking-wide group-hover:text-white transition-colors duration-300" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>Google Maps</span>
              </div>
              <span className="text-white/50 text-xs font-medium uppercase tracking-wider group-hover:text-white/70 transition-colors duration-300" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>Servicio #1 en San Miguel</span>
            </div>
          </a>
        </motion.div>
      </section>
    );
};

export default HeroSection;
