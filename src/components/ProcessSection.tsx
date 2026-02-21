import { Droplets, SprayCan, Shield, Sparkles } from "lucide-react";

const steps = [
  {
    icon: <Droplets className="w-7 h-7" />,
    title: "Lavado Químico",
    desc: "Limpieza profunda con soluciones especializadas que eliminan toda impureza sin dañar los componentes.",
  },
  {
    icon: <SprayCan className="w-7 h-7" />,
    title: "Descontaminado",
    desc: "Proceso de descontaminación completa que elimina residuos microscópicos y oxidación.",
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: "Pasta / Metal Líquido",
    desc: "Re-aplicación profesional de pasta térmica premium o metal líquido para máximo rendimiento.",
  },
  {
    icon: <Sparkles className="w-7 h-7" />,
    title: "Encerado Mate",
    desc: "Acabado protector con encerado mate que deja tu equipo con aspecto de fábrica.",
  },
];

const ProcessSection = () => {
  return (
    <section id="proceso" className="py-24 bg-dark-section">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-heading font-semibold text-sm tracking-widest uppercase">
            Nuestro Proceso
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mt-3">
            Diferenciadores Técnicos
          </h2>
          <p className="mt-4 text-surface-dark-foreground/60 max-w-lg mx-auto">
            Cada equipo pasa por nuestro proceso completo de 4 pasos para un resultado impecable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.title} className="text-center group">
              <div className="relative mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                {step.icon}
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-heading font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-surface-dark-foreground/60 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
