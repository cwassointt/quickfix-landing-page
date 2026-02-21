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
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* Dialog panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl pointer-events-auto transition-all duration-300 ${
            open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"
          }`}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-[#0d0d0d] border-b border-white/8">
            <h2 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              {data.title}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {data.tiers.map((tier) => {
              const isPads = tier.isPads;
              return (
                <div
                  key={tier.name}
                  className={`rounded-xl overflow-hidden border transition-all duration-200 ${
                    isPads
                      ? "border-orange-500/40 shadow-md shadow-orange-500/10"
                      : "border-white/8"
                  }`}
                >
                  {/* Tier header */}
                  <div
                    className={`flex items-center justify-between px-5 py-4 ${
                      isPads
                        ? "bg-gradient-to-r from-orange-500/20 to-orange-500/5"
                        : "bg-white/3"
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
                      className={`font-black text-base whitespace-nowrap ml-4 ${isPads ? "text-orange-400" : "text-orange-500"}`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {tier.price}
                    </span>
                  </div>

                  {/* Items */}
                  <div className={`px-5 py-4 space-y-2.5 ${isPads ? "bg-orange-500/3" : ""}`}>
                    {tier.items.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isPads ? "text-orange-400" : "text-orange-500"}`} />
                        <span className="text-sm text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>
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
          <div className="sticky bottom-0 px-6 py-4 bg-[#0d0d0d] border-t border-white/8">
            <a
              href="https://wa.me/51940755119?text=Hola%2C%20quiero%20agendar%20un%20mantenimiento"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-400 text-white py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-orange-500/30"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Agenda este servicio por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceDialog;

