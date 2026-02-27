import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { useState, memo } from "react";
import WarrantyDialog from "@/components/WarrantyDialog";
import TermsDialog from "@/components/TermsDialog";

// Static data outside component
const SERVICE_LINKS = [
  "PC de Escritorio", "Tarjetas Gráficas", "Laptops",
  "MacBooks", "Consolas", "Software y Hardware",
];

const Footer = memo(() => {
  const [warrantyOpen, setWarrantyOpen] = useState(false);
  const [termsOpen, setTermsOpen]       = useState(false);

  return (
    <>
      <footer className="bg-[#050505] border-t border-white/10 pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <p className="font-black text-2xl tracking-tight text-white mb-4" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                Quick<span className="text-orange-500">Fix</span>
              </p>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm mb-6">
                Servicio técnico especializado en hardware de alto rendimiento.
                Devolvemos la ingeniería original a su equipo con procesos de laboratorio.
              </p>
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-orange-500 text-xs font-bold uppercase tracking-wider">Atención Previa Cita</span>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Servicios</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                {SERVICE_LINKS.map((label) => (
                  <li key={label}>
                    <a href="#servicios" className="hover:text-white transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Location */}
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Contacto y Ubicación</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 text-orange-500 shrink-0" />
                  <a
                    href="https://wa.me/51940755119"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    +51 940 755 119
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 text-orange-500 shrink-0" />
                  <a
                    href="mailto:quickfix.pe24@gmail.com"
                    className="hover:text-white transition-colors"
                  >
                    quickfix.pe24@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-orange-500 shrink-0" />
                  <span>Talambo 135, San Miguel,<br />Lima, Perú</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 text-orange-500 shrink-0" />
                  <span>24 Horas / 7 Días<br /><span className="text-xs opacity-60">(Previa coordinación)</span></span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">© {new Date().getFullYear()} QuickFix. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setTermsOpen(true)}
                className="text-xs text-gray-600 hover:text-orange-500 cursor-pointer transition-colors"
              >
                Términos
              </button>
              <button
                onClick={() => setWarrantyOpen(true)}
                className="text-xs text-gray-600 hover:text-orange-500 cursor-pointer transition-colors"
              >
                Garantía
              </button>
            </div>
          </div>
        </div>
      </footer>

      <WarrantyDialog open={warrantyOpen} onClose={() => setWarrantyOpen(false)} />
      <TermsDialog    open={termsOpen}    onClose={() => setTermsOpen(false)} />
    </>
  );
});

export default Footer;
