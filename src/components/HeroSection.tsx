import heroBg from "@/assets/hero-bg.jpg";
import { MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/51940755119?text=Hola%2C%20quiero%20agendar%20un%20mantenimiento";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Mantenimiento profesional de laptop gamer"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-dark/95 via-surface-dark/80 to-surface-dark/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-sm font-medium font-heading tracking-wide">
              Abierto 24 horas · San Miguel, Lima
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-surface-dark-foreground leading-tight mb-6 animate-fade-up">
            Experto en{" "}
            <span className="text-gradient-orange">Metal Líquido</span>
            <br />
            para equipos de alta gama
          </h1>

          <p className="text-lg md:text-xl text-surface-dark-foreground/70 mb-10 max-w-lg animate-fade-up" style={{ animationDelay: "0.15s" }}>
            ASUS ROG STRIX y similares. Lavado químico, descontaminado y acabado con encerado mate en cada servicio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-heading font-semibold text-lg hover:brightness-110 transition-all duration-200 glow-orange"
            >
              <MessageCircle className="w-5 h-5" />
              Agenda tu mantenimiento
            </a>
            <a
              href="#servicios"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg border border-surface-dark-foreground/20 text-surface-dark-foreground font-heading font-medium hover:border-primary/50 hover:text-primary transition-all duration-200"
            >
              Ver servicios
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-surface-dark-foreground/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 rounded-full bg-primary" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
