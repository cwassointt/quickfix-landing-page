import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useState, lazy, Suspense, useRef, useCallback, memo } from "react";
import { motion, useInView } from "framer-motion";
import { Activity, Cpu } from "lucide-react"; // Removed Microscope import
import OptimizedImage from "@/components/OptimizedImage";

const ServiceDialog = lazy(() => import("./ServiceDialog"));

import laptopImg    from "../images/services/laptop-maintenance.webp";
import pcGamerImg   from "../images/services/pc-gamer-setup.webp";
import gpuImg       from "../images/services/gpu-maintenance.webp";
import macbookImg   from "../images/services/macbook-maintenance.webp";
import consoleImg   from "../images/services/console-ps5.webp";
import hardwareImg  from "../images/services/hardware-tools.webp";

// Added Repair Images
import gpuRepairImg         from "../images/repair/gpu-repair.webp";
import laptopGamerRepairImg from "../images/repair/laptopgamer-repair.webp";
import laptopOfficeRepairImg from "../images/repair/laptopoffice-repair.webp";

// ── CSS for image hover scale + will-change on hover only ─────────
const _css = `
  .card-img { transition: transform 0.6s ease; }
  .service-card:hover .card-img { transform: scale(1.06); }
  .service-card { will-change: auto; }
  .service-card:hover { will-change: transform; }
  @keyframes arrowNudge {
    0%, 100% { transform: translateX(0); }
    40%       { transform: translateX(4px); }
    70%       { transform: translateX(-1px); }
  }
  .arrow-nudge { display: inline-block; animation: arrowNudge 4s ease-in-out infinite; }
`;
if (typeof document !== "undefined" && !document.getElementById("services-css")) {
  const el = document.createElement("style"); el.id = "services-css"; el.textContent = _css; document.head.appendChild(el);
}

interface Service {
  id: string; title: string; image: string; tags: string[];
  tiers: { title: string; subtitle?: string; price: string }[];
}

const services: Service[] = [
  { id: "laptops",  title: "Mantenimiento Laptops",       image: laptopImg,   tags: ["A domicilio", "En taller"], tiers: [{ title: "MANTENIMIENTO", subtitle: "Preventivo / Correctivo", price: "S/. 80 a 150" }, { title: "PADS TÉRMICOS", subtitle: "Alto Rendimiento", price: "Desde S/. 70" }] },
  { id: "pc-gamer", title: "Mantenimiento Computadoras",  image: pcGamerImg,  tags: ["En taller"],                tiers: [{ title: "BÁSICO", subtitle: "Mantenimiento Preventivo", price: "S/. 65" }, { title: "PROFUNDO", subtitle: "Mantenimiento Correctivo", price: "S/. 100 a 250" }] },
  { id: "gpu",      title: "Mantenimiento GPU",           image: gpuImg,      tags: ["A domicilio", "En taller"], tiers: [{ title: "BÁSICO", subtitle: "Mantenimiento Preventivo", price: "S/. 25" }, { title: "PROFUNDO", subtitle: "Mantenimiento Correctivo", price: "S/. 50 a 150" }] },
  { id: "macbook",  title: "Mantenimiento MacBook",       image: macbookImg,  tags: ["A domicilio", "En taller"], tiers: [{ title: "MANTENIMIENTO", subtitle: "Servicio General", price: "S/. 100 a 150" }] },
  { id: "consoles", title: "Mantenimiento Consolas",      image: consoleImg,  tags: ["En taller"],                tiers: [{ title: "MANTENIMIENTO", subtitle: "PS4 / PS5 / Xbox", price: "S/. 70 a 150" }, { title: "PADS TÉRMICOS", subtitle: "Alto Rendimiento", price: "S/. 70" }] },
  { id: "upgrade",  title: "Software & Hardware",         image: hardwareImg, tags: ["En taller"],                tiers: [{ title: "DIAGNÓSTICO", subtitle: "Revisión técnica", price: "Desde S/. 50" }, { title: "ENSAMBLE", subtitle: "Instalación hardware", price: "Desde S/. 70" }] },
];

const repairServices = [
  {
    id: "gpu",
    title: "Reparación de GPU (Alta Gama)",
    detail: "RTX 3060+, RTX 4060+",
    img: gpuRepairImg,
    diagPrice: "S/. 99", diagTime: "48-72h lab.",
    repairPrice: "S/. 299", repairTime: "3-4 días lab.",
    waName: "Tarjeta de Video",
    features: [
      "Re-balling y reemplazo de módulos VRAM.",
      "Corrección de cortocircuitos en fases de poder (MOSFETs/VRM).",
      "Reprogramación de BIOS y reconstrucción de pistas.",
      "Sustitución de conectores dañados (HDMI/DisplayPort)."
    ]
  },
  {
    id: "laptop-gamer",
    title: "Reparación de Laptops Gamer",
    detail: "ASUS ROG, TUF, Lenovo LOQ",
    img: laptopGamerRepairImg,
    diagPrice: "S/. 99", diagTime: "48-72h lab.",
    repairPrice: "Desde S/. 399", repairTime: "2-4 días lab.",
    waName: "Laptop Gamer",
    features: [
      "Recuperación de placa madre por cortos o humedad.",
      "Reparación de circuitos de carga (IC Charge) y encendido.",
      "Reprogramación de chip KBC / Super I/O.",
      "Mitigación de daños por derrame de metal líquido."
    ]
  },
  {
    id: "laptop-office",
    title: "Reparación de Laptops de Oficina",
    detail: "HP, Acer, Lenovo",
    img: laptopOfficeRepairImg,
    diagPrice: "S/. 99", diagTime: "48-72h lab.",
    repairPrice: "Desde S/. 199", repairTime: "2-4 días lab.",
    waName: "Laptop de Oficina",
    features: [
      "Diagnóstico de fallos de encendido (Dead Board).",
      "Reparación del circuito de salida de video (eDP/Backlight) en placa madre.",
      "Reemplazo de puertos E/S (Type-C, USB, Power Jack).",
      "Lavado químico profundo para recuperación por derrame de líquidos."
    ]
  },
];

const sectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
};

const headerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// Simplified — only opacity + y, no scale to reduce composite layers
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: i * 0.04 },
  }),
};

// ── Price — plain span, no animation to avoid 12 IntersectionObservers ──
const Price = memo(({ price }: { price: string }) => (
  <span className="text-[14px] font-bold text-white mt-auto" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
    {price}
  </span>
));

// ── ServiceCard ───────────────────────────────────────────────────
interface CardProps { service: Service; index: number; onClick: (s: Service) => void; }

const ServiceCard = memo(({ service, index, onClick }: CardProps) => (
  <motion.div
    custom={index}
    variants={cardVariants}
    layout={false}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="service-card group relative bg-[#0f0f0f] rounded-2xl overflow-hidden cursor-pointer border border-[#333333] flex flex-col h-full"
    onClick={() => onClick(service)}
  >
    {/* Image — CSS scale, no JS hover handler */}
    <div className="relative h-52 shrink-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent z-10 opacity-60" />
      <OptimizedImage
        src={service.image}
        alt={service.title}
        width={800}
        className="card-img w-full h-full object-cover"
        height={400}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2 justify-end">
        {service.tags.map((tag) => (
          <span
            key={tag}
            className={`text-[9px] md:text-[10px] uppercase font-medium tracking-widest px-2.5 py-1 rounded-full backdrop-blur-sm border
              ${tag === "A domicilio"
                ? "bg-orange-500/20 text-orange-200 border-orange-500/30"
                : "bg-black/40 text-white/70 border-white/10"
              }`}
            style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>

    {/* Content */}
    <div className="p-6 flex flex-col flex-grow relative">
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <h3 className="text-xl font-bold mb-5 text-white line-clamp-1" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
        {service.title}
      </h3>

      <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
        {service.tiers.map((tier, i) => (
          <div key={i} className="flex flex-col">
            <span className="text-[11px] uppercase tracking-[0.1em] text-orange-500 font-bold mb-1" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
              {tier.title}
            </span>
            {tier.subtitle && (
              <span className="text-[11px] text-white/50 leading-tight mb-1" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                {tier.subtitle}
              </span>
            )}
            <Price price={tier.price} />
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-center text-sm font-medium text-orange-500/90 group-hover:text-orange-400 transition-colors" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
        <span className="flex items-center gap-2">
          Ver detalles
          <span className="arrow-nudge text-lg leading-none">→</span>
        </span>
      </div>
    </div>
  </motion.div>
));

// ── Main Section ──────────────────────────────────────────────────
const ServicesSection = () => {
  const sectionRef = useRef(null);
  const isInView   = useInView(sectionRef, { once: true, margin: "-80px" });
  
  // Ref separate for Advanced Repair to animate when scrolled down
  const repairRef = useRef(null);
  const repairInView = useInView(repairRef, { once: true, margin: "-100px" });

  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleOpen  = useCallback((s: Service) => setSelectedService(s), []);
  const handleClose = useCallback(() => setSelectedService(null), []);

  return (
    <section
      id="servicios"
      ref={sectionRef}
      className="py-20 bg-black text-white relative overflow-hidden"
      style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: "radial-gradient(circle at 50% 50%, #2B1400 0%, #000000 70%)" }} />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div variants={sectionVariants} initial="hidden" animate={isInView ? "visible" : "hidden"} className="flex flex-col items-center mb-16 text-center">
          <motion.span variants={headerVariants} className="text-orange-500 font-medium text-sm tracking-widest uppercase inline-block mb-3">Mantenimiento Premium</motion.span>
          <motion.h2 variants={headerVariants} className="text-4xl md:text-5xl font-bold text-white tracking-tight">Restauración Térmica y Limpieza</motion.h2>
          <motion.p variants={headerVariants} className="mt-4 text-white/40 max-w-2xl font-light text-lg">Protocolos de mantenimiento profundo con metal líquido y pads térmicos para estabilizar temperaturas y recuperar el rendimiento extremo de fábrica.</motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} onClick={handleOpen} />
          ))}
        </motion.div>

        {/* ── MOVED SECTION: Advanced Electronic Repair ── */}
        <div ref={repairRef} className="mt-16 mb-10 relative z-20 border-t border-white/5 pt-20">
          <div className="flex flex-col items-center mb-16 text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }} animate={repairInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
              className="flex items-center gap-2 justify-center text-orange-500 font-medium text-sm tracking-widest uppercase mb-3"
              style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
            >
              Laboratorio Técnico
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }} animate={repairInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-5"
              style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
            >
              Reparación Electrónica a Nivel de Componente
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={repairInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/40 max-w-2xl font-light text-lg"
              style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
            >
              Diagnóstico de precisión y microsoldadura para hardware de alto valor. Recuperamos lo que otros dan por perdido.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {repairServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={repairInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group relative bg-[#0A0A0A] rounded-3xl overflow-hidden border border-white/5 hover:border-orange-500/50 transition-colors duration-500 flex flex-col h-full shadow-2xl shadow-black/50"
              >
                {/* Glow & Border Hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Expanded Image Area (Vertical increase) */}
                <div className="relative w-full h-64 overflow-hidden border-b border-white/5">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-10 opacity-80" />
                  <OptimizedImage
                    src={service.img}
                    alt={service.title}
                    width={800}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 right-4 z-20 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-lg">
                    <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                      {service.detail}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 relative z-10 flex flex-col flex-1 bg-[#0A0A0A]">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-6 leading-tight min-h-[3.5rem]" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                    {service.title}
                  </h3>

                  <div className="space-y-4 mb-8">
                    {/* Diagnostic Block */}
                    <div className="flex flex-col gap-1 p-4 rounded-xl bg-white/[0.03] border border-white/5 group-hover:bg-white/[0.05] transition-colors">
                       <span className="flex items-center gap-2 text-orange-400 text-[11px] font-bold uppercase tracking-wider" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                         <Activity className="w-4 h-4" /> Diagnóstico
                       </span>
                      <div className="flex justify-between items-end mt-1">
                        <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>{service.diagPrice}</span>
                        <span className="text-white/40 text-[11px] text-right font-medium tracking-wide" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>{service.diagTime}</span>
                      </div>
                    </div>

                    {/* Repair Block */}
                    <div className="flex flex-col gap-1 p-4 rounded-xl bg-white/[0.03] border border-white/5 group-hover:bg-white/[0.05] transition-colors">
                       <span className="flex items-center gap-2 text-green-400 text-[11px] font-bold uppercase tracking-wider" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                         <Cpu className="w-4 h-4" /> Reparación Base
                       </span>
                      <div className="flex justify-between items-end mt-1">
                        <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>{service.repairPrice}</span>
                        <span className="text-white/40 text-[11px] text-right font-medium tracking-wide" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>{service.repairTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* New Technical Bullet Points */}
                  <div className="mb-8 pl-1">
                     <ul className="space-y-3">
                       {service.features.map((feature, i) => (
                         <li key={i} className="flex items-start gap-3">
                           <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0 opacity-80" />
                           <span className="text-sm text-gray-400 font-light leading-relaxed" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                             {feature}
                           </span>
                         </li>
                       ))}
                     </ul>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5">
                    <a
                      href={`https://wa.me/51940755119?text=Hola%20QuickFix,%20solicito%20un%20diagnóstico%20electrónico%20para%20mi%20${encodeURIComponent(service.waName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 rounded-xl bg-orange-500 hover:bg-[#FF6600] text-white font-extrabold text-xs tracking-[0.1em] uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_4px_25px_rgba(249,115,22,0.5)] hover:-translate-y-1 text-center flex items-center justify-center gap-2"
                      style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
                    >
                      Solicitar Diagnóstico
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {selectedService && (
          <Suspense fallback={<div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />}>
            <ServiceDialog open={!!selectedService} onClose={handleClose} serviceId={selectedService.id} />
          </Suspense>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
