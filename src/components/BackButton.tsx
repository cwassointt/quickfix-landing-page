import { ArrowLeft } from "lucide-react";

/**
 * Vuelve a donde estaba el visitante. Con historial de esta misma web usa "atrás" del navegador,
 * que restaura la posición exacta del scroll; si llegó desde Google, va a `fallback`.
 */
const BackButton = ({ fallback = "/", label = "Volver" }: { fallback?: string; label?: string }) => (
  <a
    href={fallback}
    onClick={(e) => {
      const fromHere = document.referrer.startsWith(window.location.origin) && window.history.length > 1;
      if (!fromHere) return;
      e.preventDefault();
      window.history.back();
    }}
    className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-5 py-3 text-white transition-[transform,background-color] duration-150 ease-out hover:bg-white/[0.14] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
  >
    <ArrowLeft className="h-5 w-5" aria-hidden="true" />
    {label}
  </a>
);

export default BackButton;
