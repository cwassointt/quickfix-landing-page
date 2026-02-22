import { MapPin, Clock, Phone, Instagram, Navigation } from "lucide-react";

const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Talambo+135+San+Miguel+Lima";
const WAZE_URL = "https://ul.waze.com/ul?place=ChIJ_Q-7BqHLBZERPsJVG4sNclY&ll=-12.07868030%2C-77.11024860&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location";

const ContactSection = () => {
  return (
    <section id="contacto" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-heading font-semibold text-sm tracking-widest uppercase">
            Encuéntranos
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mt-3 text-foreground">
            Contacto y Ubicación
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground">Dirección</h3>
                <p className="text-muted-foreground">Talambo 135, San Miguel, Lima</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground">Horario</h3>
                <p className="text-muted-foreground">Abierto las 24 horas</p>
                <p className="text-xs text-orange-500 font-bold uppercase tracking-wider mt-1">Atención solo con previa cita</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground">WhatsApp</h3>
                <a href="https://wa.me/51940755119" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  +51 940 755 119
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground">Instagram</h3>
                <a href="https://instagram.com/quickfix.pe" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  @quickfix.pe
                </a>
              </div>
            </div>
          </div>

          {/* Map card */}
          <div className="rounded-xl overflow-hidden border border-border h-80 bg-[#0a0a0a] relative">
            {/* Google Maps iframe */}
            <iframe
              title="Ubicación QuickFix"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.488479110966!2d-77.11282352517016!3d-12.078675042495265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105cba106bb0ffd%3A0x56720d8b1b55c23e!2sQuickFix.pe!5e0!3m2!1ses-419!2spe!4v1771690757299!5m2!1ses-419!2spe"
              className="absolute inset-0 w-full h-full border-0"
              style={{
                filter: "invert(90%) hue-rotate(180deg) saturate(0.6) brightness(0.85) contrast(1.1)",
              }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />

            {/* Overlay container — pointer-events-none so clicks pass through to iframe */}
            <div className="absolute inset-0 pointer-events-none">
              {/* "Cómo llegar" button — top right, pointer-events-auto so it's clickable */}
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
