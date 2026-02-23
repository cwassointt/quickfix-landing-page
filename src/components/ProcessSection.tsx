import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Droplets, SprayCan, Shield, Sparkles, Flame, Thermometer, Wind, Layers, FlaskConical } from "lucide-react";

const getMaterialImage = (filename: string) => `../src/images/materials/${filename}`;

const steps = [
  { icon: "droplets",  title: "Lavado Químico",       desc: "Limpieza profunda con soluciones especializadas que eliminan toda impureza sin dañar los componentes." },
  { icon: "spray",     title: "Descontaminado",        desc: "Proceso de descontaminación completa que elimina residuos microscópicos y oxidación." },
  { icon: "shield",    title: "Pasta / Metal Líquido", desc: "Re-aplicación profesional de pasta térmica premium o metal líquido para máximo rendimiento." },
  { icon: "sparkles",  title: "Encerado Mate",         desc: "Acabado protector con encerado mate que deja tu equipo con aspecto de fábrica." },
];

const materials = [
  {
    icon: <Flame className="w-5 h-5" />,
    category: "Metal Líquido",
    img: "GRIZZLY.webp",
    items: [
      { name: "Thermalright Silver King",                      spec: "79 w/mK" },
      { name: "Thermal Grizzly Ultra High Performance",        spec: "73 w/mK" },
    ],
  },
  {
    icon: <Thermometer className="w-5 h-5" />,
    category: "Masilla Térmica",
    img: "UTP8.webp",
    items: [
      { name: "UTP-8 Upsiren", spec: "14.8 w/mK" },
    ],
  },
  {
    icon: <Thermometer className="w-5 h-5" />,
    category: "Pasta Térmica",
    img: "TF8.webp",
    items: [
      { name: "Thermalright TF8", spec: "13.8 w/mK" },
      { name: "Arctic MX4",       spec: "8 w/mK" },
    ],
  },
  {
    icon: <Layers className="w-5 h-5" />,
    category: "Pads Térmicos",
    img: "ODDYSEY.webp",
    items: [
      { name: "Thermalright Extreme Odyssey II", spec: "14.8 w/mK" },
    ],
  },
  {
    icon: <Droplets className="w-5 h-5" />,
    category: "Lavado",
    img: "VISTONY.webp",
    items: [
      { name: "Vistony Limpiador de Contactos", spec: null },
    ],
  },
  {
    icon: <FlaskConical className="w-5 h-5" />,
    category: "Descontaminado",
    img: "950.webp",
    items: [
      { name: "Mechanic 950 Cleaning Agent", spec: null },
      { name: "Arctic MX Cleaner",           spec: null },
    ],
  },{
    icon: <Wind className="w-5 h-5" />,
    category: "Encerado",
    img: "B4QUICKFIX.webp",
    items: [
      { name: "QuickFix B4 Premium Matte", spec: null },
    ],
  },
];

const LEDSpec = ({ spec }: { spec: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
      <motion.span
          ref={ref}
          className="text-xs text-orange-500 font-bold font-mono tracking-wide"
          style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
          initial={{ opacity: 0 }}
          animate={isInView ? {
            opacity: [0, 1, 0.2, 1, 0.4, 1],
          } : { opacity: 0 }}
          transition={{
            duration: 0.9,
            ease: "easeInOut",
            times: [0, 0.2, 0.35, 0.55, 0.75, 1],
            delay: 0.2,
          }}
      >
        {spec}
      </motion.span>
  );
};

const GlowSweepCard = ({ children, sweepDelay }: { children: React.ReactNode; sweepDelay: number }) => (
    <div className="relative overflow-hidden rounded-3xl h-full">
      <motion.div
          className="absolute inset-y-0 w-1/2 pointer-events-none z-20"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,102,0,0.10) 50%, transparent 100%)",
          }}
          initial={{ x: "-100%" }}
          animate={{ x: "250%" }}
          transition={{
            duration: 1.4,
            ease: "easeInOut",
            delay: sweepDelay,
          }}
      />
      {children}
    </div>
);

const StepIcon = ({
                    type,
                    index,
                    activeStep,
                  }: {
  type: string;
  index: number;
  activeStep: number;
}) => {
  const isActive = activeStep === index;

  const iconEl = (() => {
    switch (type) {
      case "droplets":
        return (
            <motion.div
                animate={isActive ? { y: [0, 3, 0] } : { y: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Droplets className="w-7 h-7" />
            </motion.div>
        );
      case "spray":
        return (
            <motion.div
                animate={isActive ? { x: [0, 2, -1, 2, 0], rotate: [0, 3, -2, 3, 0] } : { x: 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
            >
              <SprayCan className="w-7 h-7" />
            </motion.div>
        );
      case "shield":
        return (
            <motion.div
                animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Shield className="w-7 h-7" />
            </motion.div>
        );
      case "sparkles":
        return (
            <motion.div
                animate={isActive ? { scale: [1, 1.2, 0.95, 1.1, 1], opacity: [1, 0.7, 1] } : { scale: 1 }}
                transition={{ duration: 0.65, ease: "easeInOut" }}
            >
              <Sparkles className="w-7 h-7" />
            </motion.div>
        );
      default:
        return null;
    }
  })();

  return (
      <motion.div
          className="relative mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
          animate={
            isActive
                ? {
                  backgroundColor: "rgb(249,115,22)",
                  color: "#fff",
                  boxShadow: "0 0 24px 6px rgba(249,115,22,0.5)",
                }
                : {
                  backgroundColor: "rgba(249,115,22,0.1)",
                  color: "rgb(249,115,22)",
                  boxShadow: "0 2px 10px rgba(249,115,22,0.1)",
                }
          }
          transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {iconEl}
        <motion.span
            className="absolute -top-2 -right-2 w-7 h-7 rounded-full border-2 border-orange-500 text-xs font-bold flex items-center justify-center z-10 transition-colors"
            animate={
              isActive
                  ? { backgroundColor: "#fff", color: "rgb(234,88,12)" }
                  : { backgroundColor: "#0a0a0a", color: "rgb(249,115,22)" }
            }
            transition={{ duration: 0.3 }}
        >
          {index + 1}
        </motion.span>
      </motion.div>
  );
};

const useCyclingSteps = (total: number, sectionInView: boolean) => {
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!sectionInView) return;

    let step = 0;
    const advance = () => {
      setActive(step);
      step++;
      if (step < total) {
        setTimeout(advance, 700);
      } else {
        const id = setInterval(() => {
          setActive((prev) => (prev + 1) % total);
        }, 1500);
        setTimeout(() => {
          return () => clearInterval(id);
        }, total * 1500 * 100);
        (window as unknown as Record<string, unknown>).__stepCycleId = id;
      }
    };
    const init = setTimeout(advance, 300);
    return () => {
      clearTimeout(init);
      const id = (window as unknown as Record<string, unknown>).__stepCycleId as ReturnType<typeof setInterval>;
      if (id) clearInterval(id);
    };
  }, [sectionInView, total]);

  return active;
};

const headerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: i * 0.12 },
  }),
};

const stepCardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: i * 0.13 },
  }),
};

const ProcessSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const activeStep = useCyclingSteps(steps.length, isInView);

  return (
      <section id="proceso" ref={sectionRef} className="py-24 bg-[#050505] overflow-hidden relative" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">

          <div className="flex flex-col items-center mb-16 text-center">
            <motion.span custom={0} variants={headerVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}
                         className="text-orange-500 font-medium text-sm tracking-widest uppercase inline-block mb-3">
              Nuestro Proceso
            </motion.span>
            <motion.h2 custom={1} variants={headerVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}
                       className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Diferenciadores Técnicos
            </motion.h2>
            <motion.p custom={2} variants={headerVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}
                      className="mt-4 text-white/40 max-w-2xl font-light">
              Cada equipo pasa por nuestro proceso completo de 4 pasos para un resultado impecable.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
                <motion.div
                    key={step.title}
                    custom={i}
                    variants={stepCardVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="text-center group p-4 rounded-2xl hover:bg-white/5 transition-colors duration-500 cursor-default"
                >
                  <StepIcon type={step.icon} index={i} activeStep={activeStep} />
                  <h3 className="font-bold text-xl mb-3 text-white" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>{step.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed group-hover:text-white/80 transition-colors" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                    {step.desc}
                  </p>
                </motion.div>
            ))}
          </div>

          {/* ── Materials ── */}
          <div className="mt-32">
            <div className="flex flex-col items-center mb-16 text-center">
              <motion.span custom={0} variants={headerVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}
                           className="text-orange-500 font-medium text-sm tracking-widest uppercase inline-block mb-3">
                Materiales Premium
              </motion.span>
              <motion.h3 custom={1} variants={headerVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}
                         className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Insumos de Alta Gama
              </motion.h3>
              <motion.p custom={2} variants={headerVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}
                        className="mt-4 text-white/40 max-w-2xl font-light">
                Selección rigurosa de compuestos térmicos y químicos de grado industrial para garantizar la máxima eficiencia de tu hardware.
              </motion.p>
            </div>

            {/* Carousel */}
            <div className="relative w-full overflow-hidden py-10">
              <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent z-20 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-[#050505] via-[#050505]/80 to-transparent z-20 pointer-events-none" />

              <div className="flex w-max animate-scroll hover:pause-scroll will-change-transform">
                {[...materials, ...materials].map((mat, index) => (
                    <div
                        key={`${mat.category}-${index}`}
                        className="relative group w-[300px] h-[400px] mx-5 bg-[#0A0A0A] rounded-3xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-2 border border-transparent hover:border-[#FF6600]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none" />

                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="flex flex-col">
                      <span className="text-[10px] font-medium text-white/60 uppercase tracking-widest mb-1"
                            style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                        Categoría
                      </span>
                          <h4 className="text-white font-bold text-lg tracking-wide"
                              style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                            {mat.category}
                          </h4>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#111] flex items-center justify-center text-orange-500 shadow-md border border-white/5 transition-all duration-300 group-hover:bg-[#FF6600] group-hover:text-white group-hover:shadow-[0_0_15px_rgba(255,102,0,0.4)]">
                          {mat.icon}
                        </div>
                      </div>

                      {/* Product image — lazy load: carrusel fuera del viewport */}
                      <div className="relative aspect-video w-full flex items-center justify-center p-4 mb-4 bg-gradient-to-b from-[#111] to-[#0A0A0A] rounded-2xl border border-white/5 group-hover:border-white/10 transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <img
                            src={getMaterialImage(mat.img)}
                            alt={mat.category}
                            loading="lazy"
                            decoding="async"
                            width={240}
                            height={135}
                            className="relative z-10 max-w-[85%] max-h-[85%] w-auto h-auto object-contain filter drop-shadow-2xl opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500 ease-out"
                        />
                      </div>

                      <div className="flex flex-col gap-3 relative z-10 flex-1 overflow-y-auto no-scrollbar">
                        {mat.items.map((item, idx) => (
                            <div key={idx} className="flex flex-col pb-3 border-b border-dashed border-white/5 last:border-0">
                        <span className="text-sm font-medium text-white/80 leading-snug group-hover:text-white transition-colors"
                              style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                          {item.name}
                        </span>
                              {item.spec && (
                                  <span className="text-xs text-orange-500 font-bold font-mono tracking-wide mt-1"
                                        style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                            {item.spec}
                          </span>
                              )}
                            </div>
                        ))}
                      </div>

                      <div className="absolute bottom-4 right-4 text-[9px] font-mono text-white/10 pointer-events-none">
                        PRT-{String(index % materials.length).padStart(2, "0")}
                      </div>
                    </div>
                ))}
              </div>
            </div>

            <p className="text-center text-sm text-white/50 mt-6 tracking-[0.05em] font-medium max-w-lg mx-auto"
               style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
              Todos los materiales son de grado profesional y seleccionados por su rendimiento térmico superior.
            </p>
          </div>
        </div>

        <style>{`
        @keyframes scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll { animation: scroll 60s linear infinite; }
        .hover\\:pause-scroll:hover { animation-play-state: paused; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      </section>
  );
};

export default ProcessSection;
