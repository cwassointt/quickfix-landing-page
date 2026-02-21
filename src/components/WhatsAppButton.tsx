import { MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/51940755119?text=Hola%2C%20quiero%20una%20cotización";

const WhatsAppButton = () => {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
    >
      {/* Tooltip */}
      <span
        className="hidden group-hover:flex items-center bg-black/90 text-white text-xs font-semibold px-3 py-2 rounded-full whitespace-nowrap shadow-lg border border-white/10 transition-all duration-200"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        ¡Escríbenos!
      </span>

      {/* Circle button */}
      <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-xl shadow-[#25D366]/40 hover:scale-110 hover:shadow-[#25D366]/60 transition-all duration-200">
        <MessageCircle className="w-7 h-7 text-white" fill="white" />
      </div>
    </a>
  );
};

export default WhatsAppButton;
