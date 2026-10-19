/**
 * Google Analytics 4. Pega aquí tu ID de medición (Admin → Flujos de datos → Web), p. ej. "G-ABC123XYZ".
 * Vacío = la web no carga Analytics ni mide nada.
 */
export const GA_ID = "G-7H8LELPGDD";

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export function track(event: string, params: Record<string, unknown> = {}) {
  window.gtag?.("event", event, params);
}

/**
 * Carga GA4 después de que la página ya se ve (no afecta la velocidad) y mide:
 * - clic_whatsapp: cualquier enlace a WhatsApp, con `lugar` (sección, navbar, flotante…)
 * - enviar_cotizacion: el botón de WhatsApp del ticket, con el total en soles
 * - cotizador_equipo: qué equipo eligen en el cotizador (lo envía QuoteSection)
 */
export function initAnalytics() {
  // Solo en el sitio publicado: tus pruebas en localhost no ensucian las estadísticas.
  if (!GA_ID || !location.hostname.endsWith("quickfix.pe")) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // gtag.js necesita el objeto `arguments`, no un array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);

  // gtag.js pesa ~190 KB: se descarga con la primera interacción o a los 4 s, para no competir con la carga.
  // Los eventos anteriores quedan en dataLayer y se envían al llegar el script.
  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
  };
  for (const ev of ["pointerdown", "keydown", "scroll", "touchstart"]) addEventListener(ev, load, { once: true, passive: true });
  setTimeout(load, 4000);

  document.addEventListener(
    "click",
    (e) => {
      const link = (e.target as Element).closest?.('a[href*="wa.me"]');
      if (!link) return;
      const lugar = link.closest("[data-lugar]")?.getAttribute("data-lugar") ?? link.closest("[id]")?.id ?? "otro";
      const total = link.getAttribute("data-total");
      if (total) track("enviar_cotizacion", { lugar, value: Number(total), currency: "PEN" });
      else track("clic_whatsapp", { lugar });
    },
    { capture: true },
  );
}
