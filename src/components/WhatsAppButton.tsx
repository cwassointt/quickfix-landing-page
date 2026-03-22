import { MessageCircle, Zap } from "lucide-react";
import { useEffect, useState } from "react";

// Updated with a more professional starting message
const WHATSAPP_URL = "https://wa.me/51940755119?text=Hola%20QuickFix%2C%20deseo%20mayor%20informaci%C3%B3n%20sobre%20sus%20servicios%20de%20mantenimiento.";

const WhatsAppButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
        className={`fixed bottom-6 right-6 md:bottom-12 md:right-12 z-[60] flex items-center justify-end gap-5 group transition-all duration-700 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}
        style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
    >
      {/* Label/Tooltip - Pill Style (Slightly larger text) */}
      <div
        className="
            hidden md:flex items-center gap-2.5 bg-black/90 backdrop-blur-md text-white text-sm font-medium px-5 py-3 rounded-full
            border border-orange-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.4)]
            transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out
            bg-gradient-to-r from-zinc-900 via-zinc-900 to-orange-950/40
        "
      >
        <Zap className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
        <span className="tracking-wide">¡Respuesta Inmediata!</span>
      </div>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="relative flex items-center justify-center group/btn"
      >
        {/* Main Button - Larger Size & Stronger Glow */}
        <div className="
            relative w-16 h-16 md:w-[72px] md:h-[72px] rounded-full
            bg-[#050505]
            border-[1.5px] border-orange-500
            flex items-center justify-center
            shadow-[0_4px_20px_rgba(255,102,0,0.15)]
            group-hover/btn:shadow-[0_0_30px_rgba(255,102,0,0.6)]
            group-hover/btn:border-orange-400
            group-hover/btn:-translate-y-1
            transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]
        ">
            {/* Minimalist Icon - Scaled Up */}
            <MessageCircle
                className="w-7 h-7 md:w-9 md:h-9 text-white transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-[-5deg]"
                strokeWidth={1.5}
            />
        </div>

        {/* Status Badge - Pinging Red Dot (Adjusted position for larger button) */}
        <div className="absolute top-0 right-0 md:top-0.5 md:right-0.5 pointer-events-none">
            <span className="flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border-[2.5px] border-[#050505]"></span>
            </span>
        </div>
      </a>
    </div>
  );
};

export default WhatsAppButton;
