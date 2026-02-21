import { MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/51940755119?text=Hola%2C%20quiero%20una%20cotización";

const WhatsAppButton = () => {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-[#fff]" />
    </a>
  );
};

export default WhatsAppButton;
