import { MapPin, Clock, Phone, Instagram } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contacto" className="py-24 bg-background">
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

          {/* Map */}
          <div className="rounded-xl overflow-hidden border border-border h-80">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.5!2d-77.09!3d-12.077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sTalambo+135%2C+San+Miguel!5e0!3m2!1ses!2spe!4v1700000000000!5m2!1ses!2spe"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación QuickFix - Talambo 135, San Miguel"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
