import heroBg from "@/assets/hero-bg.jpg";
import { ArrowRight, MessageCircle, Star, Trophy } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/51940755119?text=Hola%2C%20quiero%20agendar%20un%20mantenimiento";
const MAPS_REVIEWS_URL = "https://www.google.com/maps/place/QuickFix.pe/@-12.078675,-77.1128235,17z/data=!3m1!4b1!4m6!3m5!1s0x9105cba106bb0ffd:0x56720d8b1b55c23e!8m2!3d-12.0786803!4d-77.1102486!16s%2Fg%2F11xyxywtk7!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black flex flex-col">

      {/* ── BACKGROUND IMAGE ── */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Componente de PC de alta gama"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
      </div>

      {/* ── LAYERS ── */}
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.88) 30%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.15) 65%, transparent 75%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 40%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ clipPath: "polygon(59.5% 0%, 61% 0%, 47.5% 100%, 46% 100%)", background: "linear-gradient(180deg, transparent 0%, rgba(249,115,22,0.08) 15%, rgba(255,255,255,0.12) 40%, rgba(249,115,22,0.18) 60%, rgba(249,115,22,0.05) 85%, transparent 100%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ clipPath: "polygon(60.2% 0%, 60.6% 0%, 47.1% 100%, 46.7% 100%)", background: "linear-gradient(180deg, transparent 0%, rgba(249,115,22,0.35) 20%, rgba(255,255,255,0.5) 50%, rgba(249,115,22,0.35) 80%, transparent 100%)" }} />

      {/* ── MAIN CONTENT — flex-1 so it fills all space above the badge ── */}
      <div className="relative z-10 flex-1 flex items-center px-8 md:px-16 lg:px-24 xl:px-32 pt-20">
        <div className="w-full max-w-[580px]">

          {/* Mini badge */}
          <div className="inline-flex items-center gap-2 mb-7">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-orange-500 text-xs font-semibold tracking-[0.2em] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
              Abierto 24 horas — San Miguel, Lima
            </span>
          </div>

          {/* H1 */}
          <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] xl:text-6xl font-black text-white leading-[1.08] mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>
            Experto en mantenimientos con{" "}
            <span className="text-orange-500">Metal Líquido</span>{" "}
            para Laptops y PCs de Gama Alta
          </h1>

          {/* Description */}
          <p className="text-white/60 text-base md:text-lg leading-relaxed mb-10 max-w-[480px]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Especialista en ASUS ROG STRIX y estaciones de trabajo. Ofrecemos mantenimiento
            profundo con lavado químico, descontaminado y acabado con encerado mate para
            maximizar el rendimiento de tu hardware.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-400 text-white px-8 py-4 rounded-lg font-semibold text-base transition-all duration-200 shadow-xl shadow-orange-500/30 hover:shadow-orange-400/40 group"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <MessageCircle className="w-5 h-5" />
              Agenda tu mantenimiento
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
            <a
              href="#servicios"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg border border-white/25 hover:border-white/60 text-white/75 hover:text-white font-semibold text-base transition-all duration-200 backdrop-blur-sm"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Ver servicios y precios
            </a>
          </div>

          {/* Stats strip */}
          <div className="flex gap-10 mt-12 pt-8 border-t border-white/10">
            {[
              { value: "24h", label: "Disponible" },
              { value: "100%", label: "Garantizado" },
              { value: "Alta Gama", label: "Especialistas" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-black text-orange-500" style={{ fontFamily: "'Inter', sans-serif" }}>{stat.value}</p>
                <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── REVIEWS BADGE — pinned to bottom, always visible without scrolling ── */}
      <div className="relative z-10 w-full">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
        <a
          href={MAPS_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 px-8 py-8 bg-black/60 backdrop-blur-md group cursor-pointer hover:bg-black/70 transition-all duration-300"
        >
          {/* Trophy */}
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/25 group-hover:bg-orange-500/25 transition-all duration-300 shrink-0">
            <Trophy className="w-7 h-7 text-orange-500" />
          </div>

          <div className="hidden md:block w-px h-10 bg-white/10" />

          {/* Stars + score */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-6 h-6 text-orange-500 fill-orange-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.8)] transition-transform duration-200 group-hover:scale-125"
                  style={{ transitionDelay: `${i * 45}ms` }}
                />
              ))}
            </div>
            <span className="text-3xl font-black text-white" style={{ fontFamily: "'Inter', sans-serif" }}>5.0</span>
          </div>

          <div className="hidden md:block w-px h-10 bg-white/10" />

          {/* Count */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white" style={{ fontFamily: "'Inter', sans-serif" }}>+130</span>
            <span className="text-base text-white/55 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>reseñas verificadas en Google</span>
          </div>

          <div className="hidden md:block w-px h-10 bg-white/10" />

          {/* Badge */}
          <div className="flex flex-col items-center md:items-start gap-1.5 text-center md:text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-orange-400 text-xs font-bold tracking-[0.18em] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                Mejor valorado
              </span>
            </div>
            <span className="text-white/70 text-sm font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
              Servicio #1 de mantenimiento en San Miguel, Lima
            </span>
          </div>
        </a>
      </div>

    </section>
  );
};

export default HeroSection;
