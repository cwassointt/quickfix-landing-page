import { MessageCircle, Zap } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/51940755119?text=Hola%2C%20quiero%20una%20cotización";

const WhatsAppButton = () => {
  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[60] flex flex-col items-end gap-3 group">
      {/* Label/Tooltip - Animated and always visible on mobile now for better conversion */}
      <div
        className="
            relative translate-y-2 opacity-0 animate-fade-in-up
            lg:opacity-0 lg:translate-x-4 lg:translate-y-0
            lg:group-hover:opacity-100 lg:group-hover:translate-x-0
            transition-all duration-300 pointer-events-none
        "
        style={{ animationDelay: '2s', animationFillMode: 'forwards' }} // Show after load
      >
        <span className="bg-[#050505] text-white text-xs md:text-sm font-bold px-4 py-2 rounded-xl shadow-xl border border-orange-500/30 flex items-center gap-2">
            <Zap className="w-3 h-3 text-orange-500 fill-orange-500" />
            ¡Respuesta Inmediata!
        </span>
        {/* Little arrow pointing down */}
        <div className="absolute -bottom-1 right-8 w-2 h-2 bg-[#050505] transform rotate-45 border-r border-b border-orange-500/30 lg:hidden"></div>
      </div>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="relative flex items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95 group/btn"
      >
        {/* Outer Glow / Pulse */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-20 animate-ping duration-1000"></span>

        {/* Second ripple */}
        <span className="absolute inline-flex h-[120%] w-[120%] rounded-full bg-green-500 opacity-10 animate-pulse"></span>

        {/* Main Button */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#25D366] via-[#128C7E] to-[#075E54] flex items-center justify-center shadow-[0_8px_30px_rgba(37,211,102,0.4)] border-[3px] border-white/10 overflow-hidden">

            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]" />

            <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-md transform group-hover/btn:rotate-12 transition-transform duration-300" fill="white" strokeWidth={1.5} />
        </div>

        {/* Notification Warning Badge */}
        <div className="absolute top-0 right-0 md:top-1 md:right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-[#111] flex items-center justify-center animate-bounce">
            <span className="text-[10px] font-bold text-white">1</span>
        </div>
      </a>

      <style>{`
        @keyframes shimmer {
            0% { transform: translateX(-150%) skewX(-15deg); }
            20% { transform: translateX(150%) skewX(-15deg); }
            100% { transform: translateX(150%) skewX(-15deg); }
        }
        @keyframes fade-in-up {
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default WhatsAppButton;
