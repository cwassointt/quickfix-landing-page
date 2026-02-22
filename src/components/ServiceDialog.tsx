import { X, Check, Zap, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// --- Data Constants ---

const PADS_TIER = {
  name: "PADS TÉRMICOS & MASILLA TÉRMICA",
  price: "S/. 70",
  isPads: true,
  items: [
    "Remover residuos de masilla térmica",
    "Limpieza profunda",
    "Lavado químico",
    "Descontaminado",
    "Medición milimétrica del pad",
    "Situar nuevos pads térmicos (Extreme Odyssey II) (14.8 w/mK)",
    "Aplicar nueva Masilla térmica UTP-8 Upsiren (14.8 w/mK)",
  ],
};

const dialogData: Record<string, { title: string; tiers: { name: string; price: string; subtitle?: string; items: string[]; note?: string; isPads?: boolean }[] }> = {
  "pc-gamer": { // Mapped from 'pc'
    title: "Limpieza de PC",
    tiers: [
      {
        name: "BÁSICO",
        price: "S/. 65",
        subtitle: "Mantenimiento Preventivo",
        items: ["Limpieza de polvo", "Re-aplicación de pasta térmica (TF8 13.8 w/mK) / (MX4 8.5 w/mK)", "Encerado mate"],
      },
      {
        name: "PROFUNDO",
        price: "S/. 100 a 250",
        subtitle: "Mantenimiento Correctivo",
        items: [
          "Desmantelar (todos los componentes)",
          "Limpieza profunda (todos los componentes)",
          "Lavado químico",
          "Descontaminado",
          "Re-ensamble de PC",
          "Re-aplicar pasta térmica (TF8 13.8 w/mK) / (MX4 8.5 w/mK)",
          "Gestión de cables",
          "Encerado mate",
          "Lubricado",
        ],
        note: "Excepto la GPU",
      },
    ],
  },
  gpu: {
    title: "Limpieza de GPU",
    tiers: [
      {
        name: "BÁSICO",
        price: "S/. 25",
        subtitle: "Mantenimiento Preventivo",
        items: ["Limpieza de polvo", "Encerado mate"],
      },
      {
        name: "PROFUNDO",
        price: "S/. 50 a 150",
        subtitle: "Mantenimiento Correctivo",
        items: [
          "Desmantelar GPU",
          "Limpieza profunda GPU",
          "Lavado químico",
          "Descontaminado",
          "Re-aplicar pasta térmica (TF8 13.8 w/mK) / (MX4 8.5 w/mK)",
          "Re-ensamble de GPU",
          "Lubricado de ventiladores",
          "Encerado mate",
        ],
        note: "No incluye pads térmicos",
      },
      PADS_TIER,
    ],
  },
  laptops: { // Mapped from 'laptop'
    title: "Limpieza de Laptop",
    tiers: [
      {
        name: "LAPTOP",
        price: "S/. 80 a 150",
        subtitle: "Mantenimiento para Laptop",
        items: [
          "Desmantelar laptop",
          "Limpieza profunda",
          "Lavado químico",
          "Descontaminado",
          "Re-aplicar pasta térmica (TF8 13.8 w/mK) / (MX4 8.5 w/mK)",
          "Re-ensamble de laptop",
          "Calibración & lubricado de bisagras",
          "Limpieza de teclado & touchpad",
          "Limpieza de pantalla",
          "Encerado mate",
        ],
        note: "No incluye pads térmicos",
      },
      PADS_TIER,
    ],
  },
  macbook: { // Mapped from 'mac'
    title: "Limpieza de MacBook",
    tiers: [
      {
        name: "MACBOOK",
        price: "S/. 100 a 150",
        subtitle: "Mantenimiento para MacBook",
        items: [
          "Desmantelar MacBook",
          "Limpieza profunda",
          "Lavado químico",
          "Descontaminado",
          "Re-aplicar pasta térmica (TF8 13.8 w/mK) / (MX4 8.5 w/mK)",
          "Re-ensamble de MacBook",
          "Limpieza de teclado & touchpad",
          "Encerado mate",
          "Limpieza de pantalla",
        ],
      },
    ],
  },
  consoles: { // Mapped from 'consola'
    title: "Limpieza de Consola",
    tiers: [
      {
        name: "CONSOLA",
        price: "S/. 70 a 150",
        subtitle: "Mantenimiento de PS4 / PS5 / Xbox",
        items: [
          "Desmantelar consola",
          "Limpieza profunda",
          "Lavado químico",
          "Descontaminado",
          "Re-aplicar pasta térmica (TF8 13.8 w/mK) / (MX4 8.5 w/mK)",
          "Re-ensamble de consola",
          "Encerado mate",
        ],
        note: "No incluye pads térmicos",
      },
      PADS_TIER,
    ],
  },
  upgrade: { // Mapped from 'hardware'
    title: "Otros Servicios",
    tiers: [
      {
        name: "ENSAMBLE PC",
        price: "Desde S/. 70",
        items: [
          "Ensamble de componentes",
          "Componentes del cliente",
          "Gestión de cables",
          "Encerado mate",
        ],
      },
      {
        name: "ENSAMBLE PERSONALIZADO",
        price: "Desde S/. 100",
        items: [
          "Ensamble personalizado según necesidad",
          "Asesoría de componentes",
          "Cotización",
          "Ensamble",
          "Gestión de cables",
          "Encerado mate",
          "Optimización del sistema operativo",
          "Windows & Office permanente",
        ],
      },
      {
        name: "DIAGNÓSTICO & REPARACIÓN",
        price: "Desde S/. 50",
        items: [
          "Diagnóstico & reparación de PC y laptop",
          "Descarte de fallas en componentes (PC)",
          "Pruebas de estrés en componentes (PC)",
          "Reparación de teclado, batería, pantalla, disco (laptop)",
          "Recuperación de datos",
          "Bypass de contraseña en Windows",
        ],
      },
      {
        name: "HARDWARE & SOFTWARE",
        price: "Desde S/. 30",
        items: [
          "Instalación de componentes (CPU, FANs, MOBO, PSU, GPU, etc.)",
          "Instalación de programas",
          "Formateo (software)",
          "Optimización de sistema operativo",
          "Windows & Office & Adobe permanente",
          "Programas (SketchUp, AutoCAD, etc.)",
        ],
      },
    ],
  },
};

// Helper to highlight keywords
const highlightKeywords = (text: string | React.ReactNode): React.ReactNode => {
  if (typeof text !== 'string') return text;

  // Highlighting technical specs (e.g., 14.8 w/mK)
  // Fix: Removed nested capturing group and ensured no leading space requirement in capture if unnecessary
  // We look for optional space before the number, but capture strictly the number onwards
  const specRegex = /((?:\d+(?:\.\d+)?)\s?w\/mK)/i;
  const parts = text.split(specRegex);

  if (parts.length > 1) {
      return (
          <span>
              {parts.map((part, i) => {
                  if (!part) return null;
                  if (specRegex.test(part)) {
                      return <span key={i} className="text-xs italic opacity-70 ml-1 font-mono">{part.trim()}</span>;
                  }
                  return <span key={i}>{part}</span>;
              })}
          </span>
      );
  }

  return text;
};

// --- Component ---

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  serviceId: string | null; // Changed from data object to ID lookup
}

const ServiceDialog = ({ open, onClose, serviceId }: ServiceDialogProps) => {
  const data = serviceId ? dialogData[serviceId] : null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!mounted || !open || !data) return null;

  // Use Portal to render outside current DOM hierarchy to fix z-index issues
  return createPortal(
    <>
      {/* Backdrop with enhanced blur and high z-index */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[100] bg-[#050505]/60 backdrop-blur-md transition-all duration-500 ease-in-out ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* Dialog panel with even higher z-index */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`
            relative w-full max-w-2xl max-h-[90vh] flex flex-col 
            bg-[#0f0f0f] border border-white/5 rounded-3xl shadow-2xl pointer-events-auto 
            transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}
          `}
          style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
        >
          {/*
            Wrapper for scrolling:
            We move overflow handling here so header/footer trigger sticky behavior correctly
            without double scrollbars.
          */}
          <div className="overflow-y-auto custom-scrollbar">

            {/* Header - Removed heavy borders, added subtle gradient */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-6 bg-[#0f0f0f]/95 backdrop-blur-xl border-b border-white/5 shrink-0">
              <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>Detalle del Servicio</span>
                  <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                    {data.title}
                  </h2>
              </div>

              {/* Minimalist Close Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {data.tiers.map((tier, idx) => {
                const isPads = tier.isPads;
                return (
                  <div
                    key={tier.name}
                    className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                      isPads
                        ? "border border-orange-500/10 bg-orange-500/[0.03]" // Subtle pads highlight
                        : "border border-white/5 bg-white/[0.02]"
                    }`}
                    style={{
                      animation: open ? `fadeIn 0.5s ease-out forwards ${(idx * 0.15) + 0.2}s` : 'none',
                      opacity: 0,
                      fontFamily: "var(--font-visual-sans, sans-serif)"
                    }}
                  >
                  {/* Tier header - Subtle gradients */}
                  <div
                    className={`flex items-start md:items-center justify-between px-5 py-4 ${
                      isPads
                        ? "bg-gradient-to-r from-orange-500/10 to-transparent"
                        : "bg-gradient-to-b from-white/5 to-transparent"
                    } flex-col md:flex-row gap-4`}
                  >
                    <div className="flex items-center gap-3">
                      {isPads && <Zap className="w-4 h-4 text-orange-500/80 shrink-0 fill-orange-500/10" />}
                      <div>
                        <p className="text-base font-bold text-white" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                          {tier.name}
                        </p>
                        {tier.subtitle && (
                          <p className="text-xs text-white/40 mt-0.5 font-normal" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                            {tier.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price Pill - Clean minimal look */}
                    <span
                      className={`
                        text-sm font-bold tracking-wide px-3 py-1 rounded-full whitespace-nowrap
                        ${isPads 
                            ? "bg-orange-500/10 text-orange-400 border border-orange-500/10" 
                            : "bg-white/5 text-white/80 border border-white/5"
                        }
                      `}
                      style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
                    >
                      {tier.price}
                    </span>
                  </div>

                  {/* Items list */}
                  <div className="px-5 py-5">
                    <ul className="space-y-3">
                        {tier.items.map((item, i) => (
                        <li
                            key={item}
                            className="flex items-start gap-3 group/item"
                            style={{
                                animation: open ? `slideInRight 0.4s ease-out forwards ${(idx * 0.2) + (i * 0.05) + 0.3}s` : 'none',
                                opacity: 0
                            }}
                        >
                            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${isPads ? "bg-orange-500" : "bg-white/20"}`} />
                            <span className="text-[14px] leading-relaxed text-white/70 font-normal" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                                {highlightKeywords(item)}
                            </span>
                        </li>
                        ))}
                    </ul>
                    {tier.note && (
                      <p className="text-xs text-white/30 mt-4 pt-4 border-t border-white/5 italic flex items-center gap-2" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                        <span className="w-1 h-1 rounded-full bg-orange-500 inline-block" />
                        {tier.note}
                      </p>
                    )}
                  </div>
                </div>
                );
              })}
            </div>

            {/* Footer CTA - Minimalist Pill Button */}
            <div className="sticky bottom-0 px-6 py-6 bg-[#0f0f0f] border-t border-white/5 shrink-0 z-20 mt-auto">
              <a
                href={`https://wa.me/51940755119?text=Hola%20QuickFix%2C%20estoy%20interesado%20en%20el%20servicio%20de%20${encodeURIComponent(data.title)}.%20%C2%BFMe%20podr%C3%ADan%20brindar%20m%C3%A1s%20detalles%3F`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-3 w-full bg-orange-500 hover:bg-[#ff6600] text-white py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 shadow-[0_4px_20px_rgba(249,115,22,0.2)] hover:shadow-[0_8px_30px_rgba(249,115,22,0.3)] hover:-translate-y-0.5"
                style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
              >
                <MessageCircle className="w-5 h-5 fill-white text-white" />
                <span className="uppercase tracking-widest text-xs">Agendar por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        /* Hide scrollbar for Chrome, Safari and Opera */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
      `}</style>
    </>,
    document.body
  );
};

export default ServiceDialog;

