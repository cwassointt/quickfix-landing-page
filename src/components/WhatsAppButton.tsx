import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { waLink } from "@/lib/site";

/** Botón flotante de WhatsApp: aparece tras bajar del hero, para no tapar el primer pantallazo. */
const WhatsAppButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      data-lugar="flotante"
      tabIndex={visible ? 0 : -1}
      className={`wa-float fixed bottom-4 right-4 z-[60] grid h-14 w-14 md:h-16 md:w-16 place-items-center rounded-full bg-primary text-black outline outline-2 outline-[#050505] transition-[transform,opacity] duration-300 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black md:bottom-8 md:right-8 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <MessageCircle className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
    </a>
  );
};

export default WhatsAppButton;
