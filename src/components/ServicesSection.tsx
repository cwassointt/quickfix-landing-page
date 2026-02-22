import { Monitor, Cpu, Laptop, Gamepad2, Wrench } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useState } from "react";
import ServiceDialog from "@/components/ServiceDialog";

// Updated image imports with new filenames
import gpuImg from "@/images/gpu-maintenance.jpg";
import pcImg from "@/images/pc-gamer-setup.png";
import laptopImg from "@/images/laptop-maintenance.jpg";
import macImg from "@/images/macbook-maintenance.jpg";
import ps5Img from "@/images/console-ps5.jpg";
import hardwareImg from "@/images/hardware-tools.jpg";
import * as React from "react";

interface ServiceCard {
  icon: React.ReactNode;
  title: string;
  image?: string;
  items: { name: string; price: string }[];
  dialogKey: string;
  tags?: string[];
}

const PADS_TIER = {
  name: "PADS TÉRMICOS & MASILLA TÉRMICA",
  price: "S/. 70",
  isPads: true,
  items: [
    "Remover residuos de masilla térmica",
    "Limpieza profunda",
    "Lavado químico",
    "Descontaminado",
    "Medición milimétrica del pad",
    "Situar nuevos pads térmicos (Extreme Odyssey II)",
    "Aplicar nueva Masilla térmica UTP-8 Upsiren (14.8 w/mK)",
  ],
};

const dialogData: Record<string, { title: string; tiers: { name: string; price: string; subtitle?: string; items: string[]; note?: string; isPads?: boolean }[] }> = {
  pc: {
    title: "Limpieza de PC",
    tiers: [
      {
        name: "BÁSICO",
        price: "S/. 65",
        subtitle: "Mantenimiento Preventivo",
        items: ["Limpieza de polvo", "Re-aplicación de pasta térmica", "Encerado mate"],
      },
      {
        name: "PROFUNDO",
        price: "S/. 100 a 250",
        subtitle: "Mantenimiento Correctivo",
        items: [
          "Desmantelar (todos los componentes)",
          "Limpieza profunda (todos los componentes)",
          "Lavado químico",
          "Descontaminado",
          "Re-ensamble de PC",
          "Re-aplicar pasta térmica (CPU)",
          "Gestión de cables",
          "Encerado mate",
          "Lubricado",
        ],
        note: "Excepto la GPU",
      },
    ],
  },
  gpu: {
    title: "Limpieza de GPU",
    tiers: [
      {
        name: "BÁSICO",
        price: "S/. 25",
        subtitle: "Mantenimiento Preventivo",
        items: ["Limpieza de polvo", "Encerado mate"],
      },
      {
        name: "PROFUNDO",
        price: "S/. 50 a 150",
        subtitle: "Mantenimiento Correctivo",
        items: [
          "Desmantelar GPU",
          "Limpieza profunda GPU",
          "Lavado químico",
          "Descontaminado",
          "Re-aplicar pasta térmica (TF9)",
          "Re-ensamble de GPU",
          "Lubricado de ventiladores",
          "Encerado mate",
        ],
        note: "No incluye pads térmicos",
      },
      PADS_TIER,
    ],
  },
  laptop: {
    title: "Limpieza de Laptop",
    tiers: [
      {
        name: "LAPTOP",
        price: "S/. 80 a 150",
        subtitle: "Mantenimiento para Laptop",
        items: [
          "Desmantelar laptop",
          "Limpieza profunda",
          "Lavado químico",
          "Descontaminado",
          "Re-aplicar pasta térmica",
          "Re-ensamble de laptop",
          "Calibración & lubricado de bisagras",
          "Limpieza de teclado & touchpad",
          "Limpieza de pantalla",
          "Encerado mate",
        ],
        note: "No incluye pads térmicos",
      },
      PADS_TIER,
    ],
  },
  mac: {
    title: "Limpieza de MacBook",
    tiers: [
      {
        name: "MACBOOK",
        price: "S/. 100 a 150",
        subtitle: "Mantenimiento para MacBook",
        items: [
          "Desmantelar MacBook",
          "Limpieza profunda",
          "Lavado químico",
          "Descontaminado",
          "Re-aplicar pasta térmica",
          "Re-ensamble de MacBook",
          "Limpieza de teclado & touchpad",
          "Encerado mate",
          "Limpieza de pantalla",
        ],
      },
      PADS_TIER,
    ],
  },
  consola: {
    title: "Limpieza de Consola",
    tiers: [
      {
        name: "CONSOLA",
        price: "S/. 70 a 150",
        subtitle: "Mantenimiento de PS4 / PS5 / Xbox",
        items: [
          "Desmantelar consola",
          "Limpieza profunda",
          "Lavado químico",
          "Descontaminado",
          "Re-aplicar pasta térmica",
          "Re-ensamble de consola",
          "Encerado mate",
        ],
        note: "No incluye pads térmicos",
      },
      PADS_TIER,
    ],
  },
  hardware: {
    title: "Otros Servicios",
    tiers: [
      {
        name: "ENSAMBLE PC",
        price: "Desde S/. 70",
        items: [
          "Ensamble de componentes",
          "Componentes del cliente",
          "Gestión de cables",
          "Encerado mate",
        ],
      },
      {
        name: "ENSAMBLE PERSONALIZADO",
        price: "Desde S/. 100",
        items: [
          "Ensamble personalizado según necesidad",
          "Asesoría de componentes",
          "Cotización",
          "Ensamble",
          "Gestión de cables",
          "Encerado mate",
          "Optimización del sistema operativo",
          "Windows & Office permanente",
        ],
      },
      {
        name: "DIAGNÓSTICO & REPARACIÓN",
        price: "Desde S/. 50",
        items: [
          "Diagnóstico & reparación de PC y laptop",
          "Descarte de fallas en componentes (PC)",
          "Pruebas de estrés en componentes (PC)",
          "Reparación de teclado, batería, pantalla, disco (laptop)",
          "Recuperación de datos",
          "Bypass de contraseña en Windows",
        ],
      },
      {
        name: "HARDWARE & SOFTWARE",
        price: "Desde S/. 30",
        items: [
          "Instalación de componentes (CPU, FANs, MOBO, PSU, GPU, etc.)",
          "Instalación de programas",
          "Formateo (software)",
          "Optimización de sistema operativo",
          "Windows & Office & Adobe permanente",
          "Programas (SketchUp, AutoCAD, etc.)",
        ],
      },
    ],
  },
};

const services: ServiceCard[] = [
  {
    icon: <Monitor className="w-6 h-6" />,
    title: "PC de Escritorio",
    image: pcImg,
    dialogKey: "pc",
    tags: ["En taller"],
    items: [
      { name: "Básico – Preventivo", price: "S/. 65" },
      { name: "Profundo – Correctivo", price: "S/. 100 - 250" },
    ],
  },
  {
    icon: <Cpu className="w-6 h-6" />,
    title: "Tarjetas Gráficas",
    image: gpuImg,
    dialogKey: "gpu",
    tags: ["A domicilio", "En taller"],
    items: [
      { name: "Básico – Preventivo", price: "S/. 25" },
      { name: "Profundo – Correctivo", price: "S/. 50 - 150" },
      { name: "Cambio Pads Térmicos (Extreme Odyssey II)", price: "Desde S/. 70" },
    ],
  },
  {
    icon: <Laptop className="w-6 h-6" />,
    title: "Laptops",
    image: laptopImg,
    dialogKey: "laptop",
    tags: ["A domicilio", "En taller"],
    items: [
      { name: "Mantenimiento completo", price: "S/. 80 - 150" },
      { name: "Cambio Pads Térmicos", price: "Desde S/. 70" },
    ],
  },
  {
    icon: <Laptop className="w-6 h-6" />,
    title: "MacBooks",
    image: macImg,
    dialogKey: "mac",
    tags: ["A domicilio", "En taller"],
    items: [
      { name: "Mantenimiento completo", price: "S/. 100 - 150" },
    ],
  },
  {
    icon: <Gamepad2 className="w-6 h-6" />,
    title: "Consolas",
    image: ps5Img,
    dialogKey: "consola",
    tags: ["En taller"],
    items: [
      { name: "PS4 / PS5 / Xbox", price: "S/. 70 - 150" },
      { name: "Cambio Pads Térmicos", price: "Desde S/. 70" },
    ],
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    title: "Software y Hardware",
    image: hardwareImg,
    dialogKey: "hardware",
    tags: ["En taller"],
    items: [
      { name: "Formateo & Optimización", price: "Desde S/. 30" },
      { name: "Diagnóstico & Reparación", price: "Desde S/. 50" },
      { name: "Ensamble de PC", price: "Desde S/. 70" },
    ],
  },
];

const ServicesSection = () => {
  const ref = useScrollReveal();
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  return (
    <section id="servicios" className="py-20 bg-background overflow-hidden">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div
              key={s.title}
              onClick={() => setOpenDialog(s.dialogKey)}
              className="group relative border border-white/5 rounded-3xl overflow-hidden hover:border-orange-500/30 hover:shadow-[0_10px_40px_-10px_rgba(249,115,22,0.15)] transition-all duration-500 bg-[#0a0a0a] cursor-pointer"
              style={{
                animation: `fadeInUp 0.6s ease-out forwards ${i * 0.1}s`,
                opacity: 0 // Start hidden for animation
              }}
            >
              {/* Fix for Safari/Chrome sub-pixel rendering line */}
              <div className="absolute inset-0 rounded-3xl border border-transparent pointer-events-none z-20 transition-colors duration-500 group-hover:border-orange-500/10" />

              {/* Image banner */}
              {s.image ? (
                <div className="relative h-60 w-full overflow-hidden isolate bg-black">
                  {/* Wrapper for scaling image + overlays together */}
                  <div
                    className="relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-110 will-change-transform"
                    style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
                  >
                    <img
                      src={s.image}
                      alt={s.title}
                      className="absolute inset-0 w-full h-full object-cover object-center scale-[1.01] transition-all duration-700 group-hover:grayscale-[0.5]" // Start vivid, slightly grayscale on hover for mood
                      style={{ backfaceVisibility: "hidden" }}
                    />

                    {/* Overlay layers */}
                    <div
                      className="absolute -inset-[1px] bg-black/40 group-hover:bg-black/20 transition-all duration-500 z-10"
                    />
                    <div
                      className="absolute -inset-[1px] z-10 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]"
                    />
                  </div>

                  {/* Content that shouldn't scale (Icons & Text) */}
                  <div className="absolute bottom-4 left-4 w-10 h-10 rounded-xl bg-orange-500/90 text-white shadow-lg shadow-orange-500/20 z-20 flex items-center justify-center backdrop-blur-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    {s.icon}
                  </div>
                  {/* "Ver detalle" hint */}
                  <div className="absolute bottom-4 right-4 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 z-20 pointer-events-none delay-75">
                    <span className="text-xs text-white font-bold tracking-wide uppercase flex items-center gap-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Ver detalle <span className="text-orange-400">→</span>
                    </span>
                  </div>
                </div>
              ) : (
                // Fallback for no image
                 <div className="h-20 w-full bg-primary/5 flex items-center justify-between px-6 border-b border-white/5">
                   {/* ... existing fallback code ... */}
                </div>
              )}

              {/* Card body */}
              <div className="p-7 relative">
                 {/* Hover Glow Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/0 via-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {s.tags && (
                  <div className="relative flex flex-wrap gap-2 mb-3">
                    {s.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 transition-transform duration-300 group-hover:scale-105"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h3 className="relative font-heading font-bold text-2xl text-white mb-5 tracking-tight group-hover:text-orange-100 transition-colors duration-300">
                  {s.title}
                </h3>
                <div className="relative space-y-3">
                  {s.items.map((item) => (
                    <div key={item.name} className="flex justify-between items-center gap-3 py-1 border-b border-white/5 last:border-0 group-hover:border-white/10 transition-colors duration-300">
                      <span className="text-sm text-gray-400 font-medium group-hover:text-gray-300 transition-colors">{item.name}</span>
                      <span className="text-sm font-bold text-orange-500 whitespace-nowrap">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS for Keyframes if not in global css */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Dialog */}
      <ServiceDialog
        open={openDialog !== null}
        onClose={() => setOpenDialog(null)}
        data={openDialog ? dialogData[openDialog] : null}
      />
    </section>
  );
};

export default ServicesSection;
