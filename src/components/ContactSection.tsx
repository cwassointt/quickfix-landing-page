import { MapPin, Clock, Phone, Instagram, Navigation } from "lucide-react";
import { memo } from "react";

const MAPS_URL     = "https://www.google.com/maps/place/QuickFix.pe/@-12.078675,-77.1128235,17z/data=!3m1!4b1!4m6!3m5!1s0x9105cba106bb0ffd:0x56720d8b1b55c23e!8m2!3d-12.0786803!4d-77.1102486!16s%2Fg%2F11xyxywtk7!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D";
const WAZE_URL     = "https://ul.waze.com/ul?place=ChIJ_Q-7BqHLBZERPsJVG4sNclY&ll=-12.07868030%2C-77.11024860&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location";
const INSTAGRAM_URL = "https://instagram.com/quickfix.pe";
const TIKTOK_URL    = "https://www.tiktok.com/@quickfixpe";
const WHATSAPP_URL  = "https://wa.me/51940755119";
const MAPS_EMBED    = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.488479110966!2d-77.11282352517016!3d-12.078675042495265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105cba106bb0ffd%3A0x56720d8b1b55c23e!2sQuickFix.pe!5e0!3m2!1ses-419!2spe!4v1771690757299!5m2!1ses-419!2spe";

// Shared card class to avoid duplication
const CARD_CLS = "flex items-center gap-6 group p-5 rounded-3xl transition-all duration-300 hover:bg-gray-50 border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md";
const ICON_CLS = "w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:bg-orange-600 group-hover:text-white group-hover:shadow-[0_0_25px_rgba(249,115,22,0.4)]";
const TITLE_CLS = "font-heading font-black text-xl text-gray-900 mb-1 group-hover:text-orange-600 transition-colors";

const ContactSection = memo(() => (
  <section id="contacto" className="py-20 bg-white relative overflow-hidden" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
    <div className="container mx-auto px-6 relative z-10">
      <div className="flex flex-col items-center mb-16 text-center">
        <span className="text-orange-600 font-medium text-sm tracking-widest uppercase inline-block mb-3">Encuéntranos</span>
        <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight">Contacto y Ubicación</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          {/* Dirección */}
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className={CARD_CLS}>
            <div className={ICON_CLS}><MapPin className="w-7 h-7" /></div>
            <div>
              <h3 className={TITLE_CLS}>Dirección</h3>
              <p className="text-gray-600 font-medium text-lg leading-snug">Talambo 135, San Miguel, Lima</p>
            </div>
          </a>

          {/* Horario */}
          <div className={CARD_CLS}>
            <div className={ICON_CLS}><Clock className="w-7 h-7" /></div>
            <div>
              <h3 className={TITLE_CLS}>Horario</h3>
              <p className="text-gray-600 font-medium text-lg leading-snug">Abierto las 24 horas</p>
              <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mt-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full inline-block">
                Atención solo con previa cita
              </p>
            </div>
          </div>

          {/* WhatsApp */}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={CARD_CLS}>
            <div className={ICON_CLS}><Phone className="w-7 h-7" /></div>
            <div>
              <h3 className={TITLE_CLS}>WhatsApp</h3>
              <span className="text-gray-600 font-medium text-lg group-hover:text-black transition-colors flex items-center gap-2">+51 940 755 119</span>
            </div>
          </a>

          {/* Instagram */}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={CARD_CLS}>
            <div className={ICON_CLS}><Instagram className="w-7 h-7" /></div>
            <div>
              <h3 className={TITLE_CLS}>Instagram</h3>
              <span className="text-gray-600 font-medium text-lg group-hover:text-black transition-colors">@quickfix.pe</span>
            </div>
          </a>

          {/* TikTok */}
          <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className={CARD_CLS}>
            <div className={ICON_CLS}>
              {/* Simple TikTok Icon SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </div>
            <div>
              <h3 className={TITLE_CLS}>TikTok</h3>
              <span className="text-gray-600 font-medium text-lg group-hover:text-black transition-colors">@quickfixpe</span>
            </div>
          </a>
        </div>

        {/* Map */}
        <div className="rounded-3xl overflow-hidden border border-gray-200 h-full min-h-[500px] bg-gray-50 relative group hover:border-orange-500/30 transition-all duration-500 hover:shadow-lg">
          <iframe
            title="Ubicación QuickFix"
            src={MAPS_EMBED}
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
          <div className="absolute inset-0 pointer-events-none bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-3 right-3 pointer-events-auto">
              <a
                href={WAZE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 shadow-lg shadow-orange-500/40 hover:scale-105"
                style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
              >
                <Navigation className="w-3.5 h-3.5" />
                Cómo llegar
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
));

export default ContactSection;
