import { Monitor, Cpu, Laptop, Gamepad2, Wrench } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useState } from "react";
import ServiceDialog from "./ServiceDialog";

// Import images directly to ensure Vite processes them correctly
import laptopImg from "../images/services/laptop-maintenance.jpg";
import pcGamerImg from "../images/services/pc-gamer-setup.png";
import gpuImg from "../images/services/gpu-maintenance.jpg";
import macbookImg from "../images/services/macbook-maintenance.jpg";
import consoleImg from "../images/services/console-ps5.jpg";
import hardwareImg from "../images/services/hardware-tools.jpg";

// Define the Service interface locally if not imported
interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  features: string[];
  price?: string;
  originalPrice?: string;
}

const services: Service[] = [
  {
    id: "laptops",
    title: "Mantenimiento Laptops",
    description: "Servicio completo para laptops de oficina y alto rendimiento.",
    image: laptopImg,
    tags: ["A domicilio", "En taller"],
    features: ["Limpieza interna", "Cambio de pasta térmica TF8", "Optimización de sistema"],
    price: "S/ 80",
  },
  {
    id: "pc-gamer",
    title: "Mantenimiento Computadoras",
    description: "Mantenimiento especializado para torres gaming y workstations.",
    image: pcGamerImg,
    tags: ["En taller"],
    features: ["Gestión de cables", "Limpieza de radiadores", "Configuración de flujo de aire"],
    price: "S/ 100",
  },
  {
    id: "gpu",
    title: "Mantenimiento GPU",
    description: "Revivimos tu tarjeta gráfica con pads térmicos de alto rendimiento.",
    image: gpuImg,
    tags: ["A domicilio", "En taller"],
    features: ["Cambio de Thermal Pads", "Limpieza ultrasónica", "Test de estrés"],
    price: "S/ 90",
  },
  {
    id: "macbook",
    title: "Apple MacBook",
    description: "Servicio delicado y preciso para toda la línea MacBook.",
    image: macbookImg,
    tags: ["A domicilio", "En taller"],
    features: ["Herramientas especializadas", "Limpieza de pantalla retina", "Diagnóstico Apple"],
    price: "S/ 120",
  },
  {
    id: "consoles",
    title: "Consolas",
    description: "PS5, Xbox y Nintendo Switch. Mantenimiento preventivo y correctivo.",
    image: consoleImg,
    tags: ["En taller"],
    features: ["Limpieza de lector", "Cambio de metal líquido (PS5)", "Ajuste de ventilación"],
    price: "S/ 70",
  },
  {
    id: "upgrade",
    title: "Software & Hardware",
    description: "Instalación de programas, formateo y upgrade de componentes.",
    image: hardwareImg,
    tags: ["En taller"],
    features: ["Licencias originales", "Instalación de RAM/SSD", "Clonación de discos"],
    price: "Cotizar",
  },
];

const ServicesSection = () => {
  const ref = useScrollReveal();
  // We only need one state for the selected service which drives the dialog
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  return (
    <section id="servicios" className="py-20 bg-black text-white relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div ref={ref} className="text-center mb-16 transition-all duration-700 ease-out transform translate-y-0 opacity-100">
          <span className="text-primary font-heading font-semibold text-sm tracking-widest uppercase inline-block animate-fade-in-up">
            Catálogo 2026
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mt-3 text-foreground tracking-tight">
            Nuestros Servicios
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-lg font-light">
            Cada servicio incluye lavado químico, descontaminado y acabado con encerado mate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="group relative bg-[#111] rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-500 border border-white/10 hover:border-orange-500/50 hover:shadow-[0_10px_40px_-10px_rgba(255,122,0,0.2)] flex flex-col h-full"
              onClick={() => setSelectedService(service)}
              style={{
                opacity: 0,
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`
              }}
            >
              {/* Image Container */}
              <div className="relative h-52 shrink-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent z-10 opacity-60" />
                  <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Tags moved to top right for better visibility */}
                  <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2 justify-end">
                      {service.tags.map((tag) => (
                          <span
                              key={tag}
                              className={`
                                  text-[10px] md:text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-lg
                                  ${tag === "A domicilio" ? "bg-orange-500 text-white" : "bg-black/60 text-white"}
                              `}
                              style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
                          >
                              {tag}
                          </span>
                      ))}
                  </div>
              </div>

              {/* Content - Fixed height layout to keep alignment uniform */}
              <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-orange-500 transition-colors line-clamp-1">
                      {service.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2 h-10">
                      {service.description}
                  </p>

                  {/* Push button to bottom */}
                  <div className="mt-auto flex items-center justify-between text-sm font-medium text-orange-500/80 group-hover:text-orange-400">
                      <span className="flex items-center gap-2">
                          Ver detalles <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
                      </span>
                  </div>
              </div>
            </div>
          ))}
         </div>

        {/* Dialog Component Connection */}
        {selectedService && (
            <ServiceDialog
                open={!!selectedService}
                onClose={() => setSelectedService(null)}
                serviceId={selectedService.id} // Passing ID instead of crafted data object
            />
        )}

        <style>{`
          @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </section>
  );
};

export default ServicesSection;
