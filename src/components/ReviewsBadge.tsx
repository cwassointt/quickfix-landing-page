import { Star, Trophy } from "lucide-react";

const MAPS_REVIEWS_URL = "https://www.google.com/maps/place/QuickFix.pe/@-12.078675,-77.1128235,17z/data=!3m1!4b1!4m6!3m5!1s0x9105cba106bb0ffd:0x56720d8b1b55c23e!8m2!3d-12.0786803!4d-77.1102486!16s%2Fg%2F11xyxywtk7!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D";

const ReviewsBadge = () => {
  return (
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
          <span
            className="text-3xl font-black text-white tracking-tighter group-hover:text-orange-400 transition-colors duration-300"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            5.0
          </span>
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

        {/* Badge Text */}
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
          <span
            className="text-4xl md:text-5xl font-black text-white leading-none tracking-tighter"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            #1
          </span>
          <div className="flex flex-col">
            <span
              className="text-base text-white/80 font-bold leading-tight"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Servicio de mantenimiento en San Miguel
            </span>
            <span
              className="text-sm text-orange-400 font-bold tracking-wider uppercase mt-1 group-hover:text-orange-300 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Ver todas las reseñas →
            </span>
          </div>
        </div>
      </a>
    </div>
  );
};

export default ReviewsBadge;

