import { MapPin, Clock, Phone, Instagram, Navigation } from "lucide-react";

// Updated Google Maps URL
const MAPS_URL = "https://www.google.com/maps/place/QuickFix.pe/@-12.078675,-77.1128235,17z/data=!3m1!4b1!4m6!3m5!1s0x9105cba106bb0ffd:0x56720d8b1b55c23e!8m2!3d-12.0786803!4d-77.1102486!16s%2Fg%2F11xyxywtk7!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D";
const WAZE_URL = "https://ul.waze.com/ul?place=ChIJ_Q-7BqHLBZERPsJVG4sNclY&ll=-12.07868030%2C-77.11024860&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location";
const INSTAGRAM_URL = "https://instagram.com/quickfix.pe";
const WHATSAPP_URL = "https://wa.me/51940755119";

const ContactSection = () => {
  return (
    <section id="contacto" className="py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-orange-600 font-heading font-bold text-sm tracking-widest uppercase">
            Encuéntranos
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-black mt-3 text-black tracking-tight">
            Contacto y Ubicación
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Info */}
          <div className="space-y-6">

            {/* Dirección Card - Clickable */}
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-6 group p-5 rounded-3xl transition-all duration-300 hover:bg-gray-50 border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:bg-orange-600 group-hover:text-white group-hover:shadow-[0_0_25px_rgba(249,115,22,0.4)]">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-heading font-black text-xl text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">Dirección</h3>
                <p className="text-gray-600 font-medium text-lg leading-snug">Talambo 135, San Miguel, Lima</p>
              </div>
            </a>

            <div className="flex items-center gap-6 group p-5 rounded-3xl transition-all duration-300 hover:bg-gray-50 border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:bg-orange-600 group-hover:text-white group-hover:shadow-[0_0_25px_rgba(249,115,22,0.4)]">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-heading font-black text-xl text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">Horario</h3>
                <p className="text-gray-600 font-medium text-lg leading-snug">Abierto las 24 horas</p>
                <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mt-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full inline-block">
                  Atención solo con previa cita
                </p>
              </div>
            </div>

            {/* WhatsApp Card - Clickable */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-6 group p-5 rounded-3xl transition-all duration-300 hover:bg-gray-50 border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:bg-orange-600 group-hover:text-white group-hover:shadow-[0_0_25px_rgba(249,115,22,0.4)]">
                <Phone className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-heading font-black text-xl text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">WhatsApp</h3>
                <span className="text-gray-600 font-medium text-lg group-hover:text-black transition-colors flex items-center gap-2">
                  +51 940 755 119
                </span>
              </div>
            </a>

            {/* Instagram Card - Clickable */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-6 group p-5 rounded-3xl transition-all duration-300 hover:bg-gray-50 border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:bg-orange-600 group-hover:text-white group-hover:shadow-[0_0_25px_rgba(249,115,22,0.4)]">
                <Instagram className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-heading font-black text-xl text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">Instagram</h3>
                <span className="text-gray-600 font-medium text-lg group-hover:text-black transition-colors">
                  @quickfix.pe
                </span>
              </div>
            </a>
          </div>

          {/* Map card */}
          <div className="rounded-3xl overflow-hidden border border-gray-200 h-[400px] bg-gray-50 relative group hover:border-orange-500/30 transition-all duration-500 hover:shadow-lg">
            {/* Google Maps iframe - Native Colors */}
            <iframe
              title="Ubicación QuickFix"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.488479110966!2d-77.11282352517016!3d-12.078675042495265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105cba106bb0ffd%3A0x56720d8b1b55c23e!2sQuickFix.pe!5e0!3m2!1ses-419!2spe!4v1771690757299!5m2!1ses-419!2spe"
              className="absolute inset-0 w-full h-full border-0 transition-all duration-700"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />

            {/* Interaction hint on hover */}
            <div className="absolute inset-0 pointer-events-none bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

             {/* "Cómo llegar" button */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-3 right-3 pointer-events-auto">
                <a
                  href={WAZE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 shadow-lg shadow-orange-500/40 hover:shadow-orange-400/50 hover:scale-105"
                  style={{ fontFamily: "'Inter', sans-serif" }}
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
  );
};

export default ContactSection;
