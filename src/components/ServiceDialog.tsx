import { X, Check, Zap } from "lucide-react";
import { useEffect } from "react";

interface ServiceTier {
  name: string;
  price: string;
  subtitle?: string;
  items: string[];
  note?: string;
  isPads?: boolean;
}

interface ServiceDialogData {
  title: string;
  tiers: ServiceTier[];
}

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  data: ServiceDialogData | null;
}

const ServiceDialog = ({ open, onClose, data }: ServiceDialogProps) => {
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!data) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-[#050505]/80 backdrop-blur-md transition-all duration-500 ease-in-out ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* Dialog panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#0f0f0f] border border-white/10 rounded-3xl shadow-2xl pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
          }`}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-[#0f0f0f]/95 backdrop-blur-xl border-b border-white/5">
            <h2 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              {data.title}
            </h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-orange-500/20 flex items-center justify-center text-white/50 hover:text-orange-500 transition-all duration-300 transform hover:rotate-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {data.tiers.map((tier, idx) => {
              const isPads = tier.isPads;
              return (
                <div
                  key={tier.name}
                  className={`rounded-2xl overflow-hidden border transition-all duration-300 hover:border-orange-500/30 ${
                    isPads
                      ? "border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.1)] bg-orange-950/5"
                      : "border-white/5 bg-white/[0.02]"
                  }`}
                  style={{
                    animation: open ? `fadeIn 0.5s ease-out forwards ${(idx * 0.1) + 0.2}s` : 'none',
                    opacity: 0
                  }}
                >
                  {/* Tier header */}
                  <div
                    className={`flex items-center justify-between px-5 py-4 ${
                      isPads
                        ? "bg-gradient-to-r from-orange-500/20 to-transparent"
                        : "bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isPads && <Zap className="w-4 h-4 text-orange-500 shrink-0" />}
                      <div>
                        <p className="text-base font-black text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {tier.name}
                        </p>
                        {tier.subtitle && (
                          <p className="text-xs text-white/45 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {tier.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`font-black text-lg whitespace-nowrap ml-4 ${isPads ? "text-orange-400" : "text-orange-500"}`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {tier.price}
                    </span>
                  </div>

                  {/* Items */}
                  <div className={`px-5 py-4 space-y-3 ${isPads ? "bg-orange-500/5" : ""}`}>
                    {tier.items.map((item, i) => (
                      <div key={item} className="flex items-start gap-3 group/item">
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 transition-transform duration-300 group-hover/item:scale-110 ${isPads ? "text-orange-400" : "text-orange-500"}`} />
                        <span className="text-sm text-white/70 group-hover/item:text-white/90 transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {item}
                        </span>
                      </div>
                    ))}
                    {tier.note && (
                      <p className="text-xs text-white/30 mt-3 pt-3 border-t border-white/8 italic" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {tier.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer CTA */}
          <div className="sticky bottom-0 px-6 py-5 bg-[#0f0f0f] border-t border-white/5">
            <a
              href="https://wa.me/51940755119?text=Hola%2C%20quiero%20agendar%20un%20mantenimiento"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-400 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Agenda este servicio por WhatsApp
            </a>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
};

export default ServiceDialog;

