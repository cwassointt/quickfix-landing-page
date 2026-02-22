// Updated image import
import heroBg from "@/images/hero-background.jpg";
import { ArrowRight, MessageCircle, Star, Trophy } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/51940755119?text=Hola%2C%20quiero%20agendar%20un%20mantenimiento";
const MAPS_REVIEWS_URL = "https://www.google.com/maps/place/QuickFix.pe/@-12.078675,-77.1128235,17z/data=!3m1!4b1!4m6!3m5!1s0x9105cba106bb0ffd:0x56720d8b1b55c23e!8m2!3d-12.0786803!4d-77.1102486!16s%2Fg%2F11xyxywtk7!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-black flex flex-col overflow-hidden">

      {/* ── BACKGROUND IMAGE (Right Side with Diagonal Clip) ── */}
      <div
        className="absolute inset-0 z-0 bg-black"
      >
         {/* The image container gets the clip-path */}
        <div
          className="absolute inset-x-0 bottom-0 top-0 md:left-[35%] md:right-0 bg-black"
          style={{
             clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
          }}
        >
            <div className="absolute inset-0">
                 <img
                    src={heroBg}
                    alt="Componente de PC de alta gama"
                    className="w-full h-full object-cover object-center opacity-80" // Reduced opacity slightly for better contrast if text overlaps on mobile
                    loading="eager"
                  />
                  {/* Cinematic Overlay on Image */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-90" />
            </div>
        </div>
      </div>

      {/* Mobile Background Fallback (Just dark overly) */}
      <div className="absolute inset-0 md:hidden bg-black/70 z-0" />


      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 flex-1 flex items-center px-6 md:px-16 lg:px-24 xl:px-32 pt-28 pb-10">
        <div className="w-full max-w-[650px]">

          {/* BRAND WATERMARK (New Addition for visual impact) */}
          <div
             className="absolute -top-10 -left-10 md:-left-20 text-[6rem] md:text-[10rem] font-black text-white/[0.03] select-none pointer-events-none z-0 tracking-tighter leading-none"
             style={{ fontFamily: "'Inter', sans-serif" }}
          >
            QUICKFIX
          </div>

          {/* Mini badge */}
          <div className="relative z-10 inline-flex items-center gap-2 mb-7 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
            <span className="text-orange-500 text-xs font-bold tracking-[0.1em] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
              Abierto 24h (Previa Cita) — San Miguel, Lima
            </span>
          </div>

          {/* Maximum performance H1 */}
          <h1 className="text-4xl md:text-5xl lg:text-[3.8rem] xl:text-[4.2rem] font-black text-white leading-[1.05] mb-6 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
            Mantenimiento de <br className="hidden md:block"/>Laptops y PCs con{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              Metal Líquido
            </span>{" "}
            en Lima, Perú
          </h1>

          {/* Description */}
          <p className="text-white/70 text-base md:text-lg leading-relaxed mb-10 max-w-[520px] font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
            Especialista en equipos ASUS ROG con tecnología de Metal Líquido, Laptops High-End y Computadoras de Gama Alta. Recuperamos el rendimiento extremo de tu máquina con procesos de laboratorio.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden inline-flex items-center justify-center gap-3 bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 shadow-[0_10px_30px_-5px_rgba(249,115,22,0.4)] hover:shadow-[0_20px_40px_-10px_rgba(249,115,22,0.6)] hover:-translate-y-1 group"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              <MessageCircle className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Agenda tu mantenimiento</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 relative z-10" />
            </a>
            <a
              href="#servicios"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/20 hover:border-white/40 text-white/90 hover:text-white font-semibold text-base transition-all duration-300 hover:bg-white/5 backdrop-blur-sm hover:-translate-y-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Ver servicios y precios
            </a>
          </div>

          {/* Stats strip */}
          <div className="flex gap-8 md:gap-14 mt-14 pt-8 border-t border-white/10 animate-fade-in delay-500">
            {[
              { value: "24h", label: "Disponibilidad" },
              { value: "+130", label: "Reseñas 5★" },
              { value: "Premium", label: "Insumos" },
            ].map((stat) => (
              <div key={stat.label} className="group cursor-default transition-all duration-300 hover:opacity-100 opacity-80">
                <p className="text-3xl md:text-3xl font-black text-white group-hover:text-orange-500 transition-colors duration-300 transform group-hover:scale-105 origin-left" style={{ fontFamily: "'Inter', sans-serif" }}>{stat.value}</p>
                <p className="text-[10px] md:text-xs text-white/40 uppercase tracking-[0.2em] mt-2 font-bold group-hover:text-white/60 transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

     {/* ── REVIEWS BADGE ── */}
      <div className="relative z-20 w-full mt-auto">
         {/* Gradient Line Separator */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

        <a
          href={MAPS_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 px-8 py-6 bg-black/80 backdrop-blur-xl border-t border-white/5 hover:bg-black/90 transition-all duration-300"
        >
          {/* Trophy - Hover: float up + glow intensity */}
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-900/10 border border-orange-500/30 shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.15)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] group-hover:-translate-y-1">
            <Trophy className="w-6 h-6 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
          </div>

          <div className="hidden md:block w-px h-8 bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />

          {/* Stars + score - Hover: Stars pop one by one */}
          <div className="flex items-center gap-3">
             <span className="text-3xl font-black text-white tracking-tighter group-hover:text-orange-400 transition-colors duration-300" style={{ fontFamily: "'Inter', sans-serif" }}>5.0</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-orange-500 fill-orange-500 transition-transform duration-200"
                  style={{ transitionDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
            {/* CSS to trigger star animation on group hover */}
             <style>{`
               .group:hover .lucide-star {
                 transform: scale(1.2);
               }
             `}</style>
          </div>

          <div className="hidden md:block w-px h-8 bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />

          {/* Review count */}
          <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
            <span
              className="text-2xl md:text-3xl font-black text-white leading-none group-hover:text-orange-100 transition-colors duration-300"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              +130
            </span>
            <span
              className="text-sm text-white/60 font-medium group-hover:text-white/80 transition-colors duration-300"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              reseñas verificadas en Google
            </span>
          </div>

          <div className="hidden md:block w-px h-8 bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />

          {/* Badge Text - Hover: Text brightens */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
             <div className="flex items-center gap-2 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>
                <span className="text-white/90 text-sm font-bold tracking-wide group-hover:text-white transition-colors duration-300" style={{ fontFamily: "'Inter', sans-serif" }}>
                 Google Maps
                </span>
             </div>
            <span className="text-white/50 text-xs font-medium uppercase tracking-wider group-hover:text-white/70 transition-colors duration-300" style={{ fontFamily: "'Inter', sans-serif" }}>
              Servicio #1 en San Miguel
            </span>
          </div>
        </a>
      </div>

    </section>
  );
};

export default HeroSection;
