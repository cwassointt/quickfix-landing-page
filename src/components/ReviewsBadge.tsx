import { Star, Trophy } from "lucide-react";

const MAPS_REVIEWS_URL = "https://www.google.com/maps/place/QuickFix.pe/@-12.078675,-77.1128235,17z/data=!3m1!4b1!4m6!3m5!1s0x9105cba106bb0ffd:0x56720d8b1b55c23e!8m2!3d-12.0786803!4d-77.1102486!16s%2Fg%2F11xyxywtk7!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D";

const ReviewsBadge = () => {
  return (
    <section className="relative bg-black overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 100% at 50% 50%, rgba(249,115,22,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
      {/* Bottom border accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

      <div className="relative container mx-auto px-6 py-10">
        <a
          href={MAPS_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 group cursor-pointer"
        >
          {/* Trophy icon */}
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/25 group-hover:bg-orange-500/25 transition-all duration-300">
            <Trophy className="w-7 h-7 text-orange-500" />
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-12 bg-white/10" />

          {/* Stars + score */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-6 h-6 text-orange-500 fill-orange-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.8)] transition-transform duration-200 group-hover:scale-125"
                  style={{ transitionDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
            <span
              className="text-4xl font-black text-white tracking-tight leading-none"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              5.0
            </span>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-12 bg-white/10" />

          {/* Review count */}
          <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
            <span
              className="text-2xl md:text-3xl font-black text-white leading-none"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              +130
            </span>
            <span
              className="text-sm text-white/60 font-medium"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              reseñas verificadas en Google
            </span>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-12 bg-white/10" />

          {/* Badge text */}
          <div className="flex flex-col items-center md:items-start gap-1.5 text-center md:text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span
                className="text-orange-400 text-xs font-bold tracking-[0.18em] uppercase"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Mejor valorado
              </span>
            </div>
            <span
              className="text-white/80 text-sm font-semibold"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Servicio #1 de mantenimiento en San Miguel, Lima
            </span>
            <span
              className="text-white/35 text-xs underline underline-offset-2 group-hover:text-orange-400 transition-colors duration-200"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Ver todas las reseñas →
            </span>
          </div>
        </a>
      </div>
    </section>
  );
};

export default ReviewsBadge;

