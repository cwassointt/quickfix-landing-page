import { Check, X } from "lucide-react";
import { COLOR_ESTADO, ESTADOS, estadoDe, progreso } from "@/lib/recepcion";

/** Barra de progreso tipo envío: Recibido → En diagnóstico → Reparado (verde) o No reparado (rojo) → Entregado. */
export function Progreso({ estado, chico = false }: { estado: string; chico?: boolean }) {
  const { etapa, mal } = progreso(estado);
  const final = mal ? COLOR_ESTADO.no_reparado : COLOR_ESTADO.reparado;
  const pasos = ["Recibido", "En diagnóstico", etapa >= 3 ? (mal ? "No reparado" : "Reparado") : "Reparado o no", "Entregado"];
  // Los dos primeros pasos en naranja; desde el resultado, verde o rojo según cómo terminó.
  const color = (i: number) => (i >= 2 ? final : "hsl(var(--primary))");
  return (
    <ol className={`${chico ? "mt-4" : "mt-5"} flex items-start`} aria-label={`Progreso: ${ESTADOS[estadoDe(estado)]}`}>
      {pasos.map((p, i) => {
        const hecho = i < etapa;
        return (
          <li key={i} title={hecho ? `${p}: hecho` : `${p}: pendiente`} className="group relative flex flex-1 flex-col items-center text-center">
            {i < pasos.length - 1 && (
              <span aria-hidden="true" className={`absolute left-1/2 ${chico ? "top-3" : "top-4"} h-1 w-full -translate-y-1/2 rounded-full transition-colors`}
                style={{ background: i + 1 < etapa ? color(i + 1) : "rgba(255,255,255,0.08)" }} />
            )}
            <span className={`relative z-10 flex ${chico ? "h-6 w-6 text-xs" : "h-8 w-8 text-sm"} items-center justify-center rounded-full border-2 font-bold transition-transform duration-150 group-hover:scale-110`}
              style={hecho
                ? { background: color(i), borderColor: color(i), color: "#000", boxShadow: i === etapa - 1 ? `0 0 0 4px ${color(i)}33` : undefined }
                : { background: "#0b0b0b", borderColor: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.45)" }}>
              {hecho ? (i === 2 && mal ? <X className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />) : i + 1}
            </span>
            <span className={`${chico ? "mt-1.5 text-[11px]" : "mt-2 text-xs"} px-1 leading-tight transition-colors group-hover:text-white ${hecho ? "font-medium text-white" : "text-white/45"}`}
              style={hecho && i >= 2 ? { color: final } : undefined}>{p}</span>
          </li>
        );
      })}
    </ol>
  );
}
