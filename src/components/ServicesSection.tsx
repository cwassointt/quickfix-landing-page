import { Monitor, Cpu, Laptop, Gamepad2, Wrench, HardDrive } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface ServiceCard {
  icon: React.ReactNode;
  title: string;
  items: { name: string; price: string }[];
}

const services: ServiceCard[] = [
  {
    icon: <Monitor className="w-6 h-6" />,
    title: "PC Desktop",
    items: [
      { name: "Básico – Preventivo", price: "S/. 65" },
      { name: "Profundo – Correctivo", price: "S/. 100 - 250" },
    ],
  },
  {
    icon: <Cpu className="w-6 h-6" />,
    title: "GPU",
    items: [
      { name: "Básico – Preventivo", price: "S/. 25" },
      { name: "Profundo – Correctivo", price: "S/. 50 - 150" },
      { name: "Cambio Pads Térmicos (Extreme Odyssey II)", price: "Desde S/. 70" },
    ],
  },
  {
    icon: <Laptop className="w-6 h-6" />,
    title: "Laptops",
    items: [
      { name: "Mantenimiento completo", price: "S/. 80 - 150" },
      { name: "Cambio Pads Térmicos", price: "Desde S/. 70" },
    ],
  },
  {
    icon: <Laptop className="w-6 h-6" />,
    title: "MacBooks",
    items: [
      { name: "Mantenimiento completo", price: "S/. 100 - 150" },
    ],
  },
  {
    icon: <Gamepad2 className="w-6 h-6" />,
    title: "Consolas",
    items: [
      { name: "PS4 / PS5 / Xbox", price: "S/. 70 - 150" },
      { name: "Cambio Pads Térmicos", price: "Desde S/. 70" },
    ],
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    title: "Software & Hardware",
    items: [
      { name: "Formateo & Optimización", price: "Desde S/. 30" },
      { name: "Diagnóstico & Reparación", price: "Desde S/. 50" },
      { name: "Ensamble de PC", price: "Desde S/. 70" },
    ],
  },
];

const ServicesSection = () => {
  const ref = useScrollReveal();

  return (
    <section id="servicios" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div ref={ref} className="text-center mb-16">
          <span className="text-primary font-heading font-semibold text-sm tracking-widest uppercase">
            Catálogo 2025
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mt-3 text-foreground">
            Nuestros Servicios
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Cada servicio incluye lavado químico, descontaminado y acabado con encerado mate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div
              key={s.title}
              className="group border border-border rounded-xl p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 bg-card"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                {s.icon}
              </div>
              <h3 className="font-heading font-semibold text-lg text-card-foreground mb-4">{s.title}</h3>
              <div className="space-y-3">
                {s.items.map((item) => (
                  <div key={item.name} className="flex justify-between items-start gap-3">
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="text-sm font-semibold text-primary whitespace-nowrap">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
