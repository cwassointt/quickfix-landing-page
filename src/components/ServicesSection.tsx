import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useState, lazy, Suspense, useRef, useEffect } from "react";
import { motion, useInView, animate, useAnimationControls } from "framer-motion";

const ServiceDialog = lazy(() => import("./ServiceDialog"));

import laptopImg from "../images/services/laptop-maintenance.webp";
import pcGamerImg from "../images/services/pc-gamer-setup.webp";
import gpuImg from "../images/services/gpu-maintenance.webp";
import macbookImg from "../images/services/macbook-maintenance.webp";
import consoleImg from "../images/services/console-ps5.webp";
import hardwareImg from "../images/services/hardware-tools.webp";

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

const sectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
};

const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.94 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      delay: i * 0.09,
    },
  }),
};

const useCyclingHighlight = (total: number, intervalMs = 2500) => {
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActiveIndex((prev) => (prev + 1) % total), intervalMs);
    return () => clearInterval(id);
  }, [total, intervalMs]);
  return activeIndex;
};

const AnimatedPrice = ({ price }: { price: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const hasAnimated = useRef(false);

  const match = price.match(/\d+/);
  const targetNum = match ? parseInt(match[0], 10) : null;
  const prefix = targetNum !== null ? price.slice(0, price.indexOf(match![0])) : "";
  const suffix = targetNum !== null ? price.slice(price.indexOf(match![0]) + match![0].length) : "";

  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isInView || hasAnimated.current || targetNum === null || !displayRef.current) return;
    hasAnimated.current = true;
    const el = displayRef.current;
    const controls = animate(0, targetNum, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => { el.textContent = Math.round(v).toString(); },
    });
    return () => controls.stop();
  }, [isInView, targetNum]);

  if (targetNum === null) {
    return (
        <span ref={ref} className="text-[14px] font-bold text-white mt-auto"
              style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
        {price}
      </span>
    );
  }

  return (
      <span ref={ref} className="text-[14px] font-bold text-white mt-auto"
            style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
      {prefix}<span ref={displayRef}>0</span>{suffix}
    </span>
  );
};

const ArrowPulse = ({ delay }: { delay: number }) => {
  const controls = useAnimationControls();

  useEffect(() => {
    const pulse = async () => {
      await controls.start({ x: 4, transition: { duration: 0.18, ease: "easeOut" } });
      await controls.start({ x: 0, transition: { duration: 0.22, ease: "easeIn" } });
    };
    const init = setTimeout(() => {
      pulse();
      const id = setInterval(pulse, 5000);
      return () => clearInterval(id);
    }, delay * 1000);
    return () => clearTimeout(init);
  }, [controls, delay]);

  return (
      <motion.span className="text-lg leading-none" animate={controls}>
        →
      </motion.span>
  );
};

const BackgroundOrb = () => (
    <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
    />
);

const BorderGlowOverlay = ({ active }: { active: boolean }) => (
    <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none z-20"
        animate={active
            ? { opacity: [0, 1, 0.7, 1, 0], boxShadow: ["0 0 0px rgba(249,115,22,0)", "0 0 18px 2px rgba(249,115,22,0.45)", "0 0 10px 1px rgba(249,115,22,0.25)", "0 0 18px 2px rgba(249,115,22,0.45)", "0 0 0px rgba(249,115,22,0)"] }
            : { opacity: 0 }
        }
        transition={{ duration: 1.8, ease: "easeInOut" }}
        style={{ border: active ? "1px solid rgba(249,115,22,0.6)" : "1px solid transparent" }}
    />
);

const ServicesSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const activeGlowIndex = useCyclingHighlight(services.length, 2600);

  return (
      <section
          id="servicios"
          ref={sectionRef}
          className="py-20 bg-black text-white relative overflow-hidden"
          style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
      >
        <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{ background: "radial-gradient(circle at 50% 50%, #2B1400 0%, #000000 70%)" }}
        /><BackgroundOrb />

        <div className="container mx-auto px-6 relative z-10">

          <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="flex flex-col items-center mb-16 text-center"
          >
            <motion.span variants={headerVariants} className="text-orange-500 font-medium text-sm tracking-widest uppercase inline-block mb-3">
              Catálogo 2026
            </motion.span>
            <motion.h2 variants={headerVariants} className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Nuestros Servicios
            </motion.h2>
            <motion.p variants={headerVariants} className="mt-4 text-white/40 max-w-2xl font-light text-lg">
              Cada servicio incluye lavado químico, descontaminado y acabado con encerado mate.
            </motion.p>
          </motion.div>

          <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
              variants={sectionVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
          >
            {services.map((service, index) => {
              const isGlowing = activeGlowIndex === index;
              return (
                  <motion.div
                      key={service.id}
                      custom={index}
                      variants={cardVariants}
                      whileHover={{
                        y: -8,
                        transition: { duration: 0.3 },
                      }}
                      className="group relative bg-[#0f0f0f] rounded-2xl overflow-hidden cursor-pointer border border-[#333333] flex flex-col h-full"
                      onClick={() => setSelectedService(service)}
                  >
                    <BorderGlowOverlay active={isGlowing} />

                    {/* Image — lazy load: estas cards están debajo del fold */}
                    <div className="relative h-52 shrink-0 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent z-10 opacity-60" />
                      <motion.img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          width={600}
                          height={400}
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
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

                    <div className="p-6 flex flex-col flex-grow relative">
                      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                      <h3
                          className="text-xl font-bold mb-5 text-white group-hover:text-white transition-colors line-clamp-1"
                          style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
                      >
                        {service.title}
                      </h3>

                      <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
                        {service.tiers.map((tier, i) => (
                            <div key={i} className="flex flex-col">
                        <span
                            className="text-[11px] uppercase tracking-[0.1em] text-orange-500 font-bold mb-1"
                            style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
                        >
                          {tier.title}
                        </span>
                              {tier.subtitle && (
                                  <span
                                      className="text-[11px] text-white/50 leading-tight mb-1"
                                      style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
                                  >
                            {tier.subtitle}
                          </span>
                              )}
                              <AnimatedPrice price={tier.price} />
                            </div>
                        ))}
                      </div>

                      <div
                          className="mt-auto flex items-center text-sm font-medium text-orange-500/90 group-hover:text-orange-400 transition-colors"
                          style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
                      >
                    <span className="flex items-center gap-2 relative">
                      Ver detalles
                      <ArrowPulse delay={index * 0.8} />
                    </span>
                      </div>
                    </div>
                  </motion.div>
              );
            })}
          </motion.div>

          {selectedService && (
              <Suspense fallback={<div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />}>
                <ServiceDialog
                    open={!!selectedService}
                    onClose={() => setSelectedService(null)}
                    serviceId={selectedService.id}
                />
              </Suspense>
          )}
        </div>
      </section>
  );
};

export default ServicesSection;
