import { Monitor, Cpu, Laptop, Gamepad2, Wrench } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useState, lazy, Suspense } from "react"; // Importar lazy y Suspense

// Lazy load del diálogo para que no pese en la carga inicial
const ServiceDialog = lazy(() => import("./ServiceDialog"));

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
  image: string;
  tags: string[];
  tiers: { title: string; subtitle?: string; price: string }[];
}

const services: Service[] = [
  {
    id: "laptops",
    title: "Mantenimiento Laptops",
    image: laptopImg,
    tags: ["A domicilio", "En taller"],
    tiers: [
      { title: "MANTENIMIENTO", subtitle: "Preventivo / Correctivo", price: "S/. 80 a 150" },
      { title: "PADS TÉRMICOS", subtitle: "Alto Rendimiento", price: "Desde S/. 70" }
    ]
  },
  {
    id: "pc-gamer",
    title: "Mantenmiento Computadoras",
    image: pcGamerImg,
    tags: ["En taller"],
    tiers: [
      { title: "BÁSICO", subtitle: "Mantenimiento Preventivo", price: "S/. 65" },
      { title: "PROFUNDO", subtitle: "Mantenimiento Correctivo", price: "S/. 100 a 250" }
    ]
  },
  {
    id: "gpu",
    title: "Mantenimiento GPU",
    image: gpuImg,
    tags: ["A domicilio", "En taller"],
    tiers: [
      { title: "BÁSICO", subtitle: "Mantenimiento Preventivo", price: "S/. 25" },
      { title: "PROFUNDO", subtitle: "Mantenimiento Correctivo", price: "S/. 50 a 150" }
    ]
  },
  {
    id: "macbook",
    title: "Mantenimiento MacBook",
    image: macbookImg,
    tags: ["A domicilio", "En taller"],
    tiers: [
      { title: "MANTENIMIENTO", subtitle: "Servicio General", price: "S/. 100 a 150" }
    ]
  },
  {
    id: "consoles",
    title: "Mantenimiento Consolas",
    image: consoleImg,
    tags: ["En taller"],
    tiers: [
      { title: "MANTENIMIENTO", subtitle: "PS4 / PS5 / Xbox", price: "S/. 70 a 150" },
      { title: "PADS TÉRMICOS", subtitle: "Alto Rendimiento", price: "S/. 70" }
    ]
  },
  {
    id: "upgrade",
    title: "Software & Hardware",
    image: hardwareImg,
    tags: ["En taller"],
     tiers: [
      { title: "DIAGNÓSTICO", subtitle: "Revisión técnica", price: "Desde S/. 50" },
      { title: "ENSAMBLE", subtitle: "Instalación hardware", price: "Desde S/. 70" }
    ]
  },
];

const ServicesSection = () => {
  const ref = useScrollReveal();
  // We only need one state for the selected service which drives the dialog
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  return (
    <section id="servicios" className="py-20 bg-black text-white relative overflow-hidden" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
       {/* 1. Efecto de Degradado y Profundidad: Radial Gradient Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: "radial-gradient(circle at 50% 50%, #2B1400 0%, #000000 70%)"
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div ref={ref} className="flex flex-col items-center mb-16 text-center transition-all duration-700 ease-out transform translate-y-0 opacity-100">
          <span className="text-orange-500 font-medium text-sm tracking-widest uppercase inline-block mb-3 animate-fade-in-up">
            Catálogo 2026
          </span>
          {/* 4. Detalle en el Título de Sección: Pure White */}
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Nuestros Servicios
          </h2>
          <p className="mt-4 text-white/40 max-w-2xl font-light text-lg">
            Cada servicio incluye lavado químico, descontaminado y acabado con encerado mate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {services.map((service, index) => (
            <div
              key={service.id}
              // 1. Efecto de Degradado y Profundidad: Borders & Hover
              className="group relative bg-[#0f0f0f] rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-500 border border-[#333333] hover:border-orange-500 hover:shadow-[0_10px_40px_-10px_rgba(255,102,0,0.15)] flex flex-col h-full"
              onClick={() => setSelectedService(service)}
              style={{
                opacity: 0,
                // 1. Efecto de Degradado y Profundidad: smooth radius
                borderRadius: '16px',
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`
              }}
            >
              {/* Image Container */}
              <div className="relative h-52 shrink-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent z-10 opacity-60" />
                  <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Tags refined opacity for minimalism */}
                  <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2 justify-end">
                      {service.tags.map((tag) => (
                          <span
                              key={tag}
                              // 2. Unificación y Corrección de Datos: Font visual sans forced
                              className={`
                                  text-[9px] md:text-[10px] uppercase font-medium tracking-widest px-2.5 py-1 rounded-full backdrop-blur-sm border 
                                  ${tag === "A domicilio" 
                                    ? "bg-orange-500/20 text-orange-200 border-orange-500/30" 
                                    : "bg-black/40 text-white/70 border-white/10"
                                  }
                              `}
                              style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
                          >
                              {tag}
                          </span>
                      ))}
                  </div>
              </div>

              {/* Content - Two Column Pricing Layout */}
              <div className="p-6 flex flex-col flex-grow relative">
                  <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                  <h3 className="text-xl font-bold mb-5 text-white group-hover:text-white transition-colors line-clamp-1" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                      {service.title}
                  </h3>

                  {/* 3. Estilo Visual de los Precios: Gap 12px (gap-3 is 0.75rem = 12px) */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
                    {service.tiers.map((tier, i) => (
                      <div key={i} className="flex flex-col">
                        {/* 3. Estilo: Title styling */}
                        <span
                          className="text-[11px] uppercase tracking-[0.1em] text-orange-500 font-bold mb-1"
                          style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
                        >
                          {tier.title}
                        </span>
                        {tier.subtitle && (
                           <span className="text-[11px] text-white/50 leading-tight mb-1" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                            {tier.subtitle}
                          </span>
                        )}
                        {/* 3. Estilo: Price larger */}
                        <span className="text-[14px] font-bold text-white mt-auto" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                          {tier.price}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Push button to bottom */}
                  <div className="mt-auto flex items-center text-sm font-medium text-orange-500/90 group-hover:text-orange-400 transition-colors" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                      <span className="flex items-center gap-2 relative">
                          Ver detalles
                          <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                      </span>
                  </div>
              </div>
            </div>
          ))}
         </div>

        {/* Dialog Component Connection */}
        {selectedService && (
          <Suspense fallback={<div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />}>
            <ServiceDialog
                open={!!selectedService}
                onClose={() => setSelectedService(null)}
                serviceId={selectedService.id}
            />
          </Suspense>
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
