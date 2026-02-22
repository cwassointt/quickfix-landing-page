import { Monitor, Cpu, Laptop, Gamepad2, Wrench } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useState } from "react";
import ServiceDialog from "@/components/ServiceDialog";

import gpuImg from "@/images/GPU.jpg";
import pcImg from "@/images/PCGAMER.png";
import laptopImg from "@/images/LAPTOPMETAL.jpg";
import macImg from "@/images/MAC.jpg";
import ps5Img from "@/images/2ps5.jpg";
import hardwareImg from "@/images/hardware.jpg";
import * as React from "react";

interface ServiceCard {
  icon: React.ReactNode;
  title: string;
  image?: string;
  items: { name: string; price: string }[];
  dialogKey: string;
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
    items: [
      { name: "Mantenimiento completo", price: "S/. 100 - 150" },
    ],
  },
  {
    icon: <Gamepad2 className="w-6 h-6" />,
    title: "Consolas",
    image: ps5Img,
    dialogKey: "consola",
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
              onClick={() => setOpenDialog(s.dialogKey)}
              className="group border border-white/10 rounded-2xl overflow-hidden hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:scale-[1.02] transition-all duration-300 bg-[#0a0a0a] cursor-pointer"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Image banner */}
              {s.image ? (
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/35 transition-all duration-300" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />
                  <div className="absolute bottom-4 left-4 w-10 h-10 rounded-lg bg-primary/90 flex items-center justify-center text-white shadow-lg shadow-primary/30">
                    {s.icon}
                  </div>
                  {/* "Ver detalle" hint */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs text-white/70 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Ver detalle →
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-20 w-full bg-primary/5 flex items-center justify-between px-6 border-b border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    {s.icon}
                  </div>
                  <span className="text-xs text-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Ver detalle →
                  </span>
                </div>
              )}

              {/* Card body */}
              <div className="p-6">
                <h3 className="font-heading font-bold text-xl text-white mb-4 tracking-wide">
                  {s.title}
                </h3>
                <div className="space-y-3">
                  {s.items.map((item) => (
                    <div key={item.name} className="flex justify-between items-start gap-3">
                      <span className="text-sm text-gray-300 font-medium">{item.name}</span>
                      <span className="text-sm font-semibold text-orange-400 whitespace-nowrap">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
