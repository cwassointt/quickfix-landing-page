import { WHATSAPP_NUMBER } from "@/lib/quote";

export const MAPS_URL =
  "https://www.google.com/maps/place/QuickFix.pe/@-12.078675,-77.1128235,17z/data=!3m1!4b1!4m6!3m5!1s0x9105cba106bb0ffd:0x56720d8b1b55c23e!8m2!3d-12.0786803!4d-77.1102486!16s%2Fg%2F11xyxywtk7";
export const MAPS_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.488479110966!2d-77.11282352517016!3d-12.078675042495265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105cba106bb0ffd%3A0x56720d8b1b55c23e!2sQuickFix.pe!5e0!3m2!1ses-419!2spe!4v1771690757299!5m2!1ses-419!2spe";
export const WAZE_URL = "https://ul.waze.com/ul?place=ChIJ_Q-7BqHLBZERPsJVG4sNclY&ll=-12.07868030%2C-77.11024860&navigate=yes";
export const INSTAGRAM_URL = "https://instagram.com/quickfix.pe";
export const TIKTOK_URL = "https://www.tiktok.com/@quickfixpe";
export const EMAIL = "quickfix.pe24@gmail.com";
export const ADDRESS = "Talambo 135, San Miguel, Lima";
export const PHONE_DISPLAY = "+51 940 755 119";
export const RATING = { score: "5.0", count: "+220" };

export const waLink = (text = "Hola QuickFix, quiero agendar una cita para mi equipo.") =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

/** Lleva al cotizador con un equipo ya elegido (QuoteSection escucha este evento). */
export const QUOTE_EVENT = "quickfix:cotizar";
export function openQuote(categoryId?: string) {
  // Sin cotizador en esta página: ir a la portada con el equipo en la URL.
  if (!document.getElementById("cotizar")) {
    window.location.href = `/${categoryId ? `?equipo=${categoryId}` : ""}#cotizar`;
    return;
  }
  if (categoryId) window.dispatchEvent(new CustomEvent(QUOTE_EVENT, { detail: categoryId }));
  scrollToId("cotizar");
}

/** Baja a una sección; si no existe en esta página, va a esa sección de la portada. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) {
    window.location.href = `/#${id}`;
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}
