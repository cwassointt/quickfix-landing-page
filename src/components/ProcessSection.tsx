import { useRef, useEffect, useState, memo, useCallback } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  useMotionValueEvent,
  useAnimationControls,
  MotionValue,
} from "framer-motion";
import { 
  Droplets, SprayCan, Shield, Sparkles, Flame, Thermometer, Wind, Layers, FlaskConical,
} from "lucide-react";

import grizllyImg   from "../images/materials/GRIZZLY.webp";
import utp8Img      from "../images/materials/UTP8.webp";
import tf8Img       from "../images/materials/TF8.webp";
import oddyImg      from "../images/materials/ODDYSEY.webp";
import visImg       from "../images/materials/VISTONY.webp";
import m950Img      from "../images/materials/950.webp";
import b4Img        from "../images/materials/B4QUICKFIX.webp";

const steps = [
  { icon: "droplets",  title: "Lavado Químico",       desc: "Limpieza profunda con soluciones especializadas que eliminan toda impureza sin dañar los componentes." },
  { icon: "spray",     title: "Descontaminado",        desc: "Proceso de descontaminación completa que elimina residuos microscópicos y oxidación." },
  { icon: "shield",    title: "Pasta / Metal Líquido", desc: "Re-aplicación profesional de pasta térmica premium o metal líquido para máximo rendimiento." },
  { icon: "sparkles",  title: "Encerado Mate",         desc: "Acabado protector con encerado mate que deja tu equipo con aspecto de fábrica." },
] as const;

const materials = [
  { icon: <Flame className="w-5 h-5" />,       category: "Metal Líquido",    img: grizllyImg, items: [{ name: "Thermalright Silver King", spec: "79 w/mK" }, { name: "Thermal Grizzly Ultra High Performance", spec: "73 w/mK" }] },
  { icon: <Thermometer className="w-5 h-5" />, category: "Masilla Térmica",  img: utp8Img,    items: [{ name: "UTP-8 Upsiren", spec: "14.8 w/mK" }] },
  { icon: <Thermometer className="w-5 h-5" />, category: "Pasta Térmica",    img: tf8Img,     items: [{ name: "Thermalright TF8", spec: "13.8 w/mK" }, { name: "Arctic MX4", spec: "8 w/mK" }] },
  { icon: <Layers className="w-5 h-5" />,      category: "Pads Térmicos",    img: oddyImg,    items: [{ name: "Thermalright Extreme Odyssey II", spec: "14.8 w/mK" }] },
  { icon: <Droplets className="w-5 h-5" />,    category: "Lavado",           img: visImg,     items: [{ name: "Vistony Limpiador de Contactos", spec: null }] },
  { icon: <FlaskConical className="w-5 h-5" />,category: "Descontaminado",   img: m950Img,    items: [{ name: "Mechanic 950 Cleaning Agent", spec: null }, { name: "Arctic MX Cleaner", spec: null }] },
  { icon: <Wind className="w-5 h-5" />,        category: "Encerado",         img: b4Img,      items: [{ name: "QuickFix B4 Premium Matte", spec: null }] },
];

// ── Tripled array para bucle infinito silencioso ─────────────────
const tripledMaterials = [...materials, ...materials, ...materials];
const CARD_WIDTH = 300 + 40; // w-[300px] + mx-5*2

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

// ── LEDSpec — CSS animation instead of framer-motion per item ─────
const LEDSpec = memo(({ spec }: { spec: string }) => (
  <span
    className="text-xs text-orange-500 font-bold font-mono tracking-wide led-flicker"
    style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
  >
    {spec}
  </span>
));

// ── StepIcon — memoized ───────────────────────────────────────────
const StepIcon = memo(({ type, index, activeStep }: { type: string; index: number; activeStep: number }) => {
  const isActive = activeStep === index;

  const iconEl = (() => {
    switch (type) {
      case "droplets": return <motion.div animate={isActive ? { y: [0, 3, 0] } : { y: 0 }} transition={{ duration: 0.6 }}><Droplets className="w-7 h-7" /></motion.div>;
      case "spray":    return <motion.div animate={isActive ? { x: [0, 2, -1, 2, 0], rotate: [0, 3, -2, 3, 0] } : { x: 0 }} transition={{ duration: 0.7 }}><SprayCan className="w-7 h-7" /></motion.div>;
      case "shield":   return <motion.div animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }} transition={{ duration: 0.5 }}><Shield className="w-7 h-7" /></motion.div>;
      case "sparkles": return <motion.div animate={isActive ? { scale: [1, 1.2, 0.95, 1.1, 1] } : { scale: 1 }} transition={{ duration: 0.65 }}><Sparkles className="w-7 h-7" /></motion.div>;
      default: return null;
    }
  })();

  return (
    <motion.div
      className="relative mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
      animate={isActive
        ? { backgroundColor: "rgb(249,115,22)", color: "#fff", boxShadow: "0 0 24px 6px rgba(249,115,22,0.5)" }
        : { backgroundColor: "rgba(249,115,22,0.1)", color: "rgb(249,115,22)", boxShadow: "0 2px 10px rgba(249,115,22,0.1)" }
      }
      transition={{ duration: 0.4 }}
    >
      {iconEl}
      <motion.span
        className="absolute -top-2 -right-2 w-7 h-7 rounded-full border-2 border-orange-500 text-xs font-bold flex items-center justify-center z-10"
        animate={isActive ? { backgroundColor: "#fff", color: "rgb(234,88,12)" } : { backgroundColor: "#0a0a0a", color: "rgb(249,115,22)" }}
        transition={{ duration: 0.3 }}
      >
        {index + 1}
      </motion.span>
    </motion.div>
  );
});

// ── useCyclingSteps — fixed interval leak ─────────────────────────
const useCyclingSteps = (total: number, sectionInView: boolean) => {
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!sectionInView) return;

    let step = 0;
    let cycleId: ReturnType<typeof setInterval> | null = null;

    const advance = () => {
      setActive(step);
      step++;
      if (step < total) {
        setTimeout(advance, 700);
      } else {
        cycleId = setInterval(() => {
          setActive((prev) => (prev + 1) % total);
        }, 1500);
      }
    };

    const initId = setTimeout(advance, 300);

    return () => {
      clearTimeout(initId);
      if (cycleId !== null) clearInterval(cycleId);
    };
  }, [sectionInView, total]);

  return active;
};

// ── MaterialCard con efecto Cover Flow ───────────────────────────
const MaterialCard = memo(({
  mat,
  index,
  motionX,
  containerWidth,
}: {
  mat: typeof materials[number];
  index: number;
  motionX: MotionValue<number>;
  containerWidth: number;
}) => {
  // Posición estática del centro de esta tarjeta en el track
  const cardCenter = index * CARD_WIDTH + CARD_WIDTH / 2;
  // Centro del viewport
  const viewCenter = containerWidth / 2;

  // Distancia dinámica al centro del viewport
  const distance = useTransform(motionX, (x) => {
    const absoluteCardCenter = cardCenter + x;
    return absoluteCardCenter - viewCenter;
  });

  const scale = useTransform(distance, [-CARD_WIDTH * 1.5, 0, CARD_WIDTH * 1.5], [0.82, 1, 0.82]);
  const opacity = useTransform(distance, [-CARD_WIDTH * 2, -CARD_WIDTH * 0.8, 0, CARD_WIDTH * 0.8, CARD_WIDTH * 2], [0.15, 0.4, 1, 0.4, 0.15]);
  const brightness = useTransform(distance, [-CARD_WIDTH * 1.5, 0, CARD_WIDTH * 1.5], [0.5, 1, 0.5]);
  const glowOpacity = useTransform(distance, [-CARD_WIDTH * 0.6, 0, CARD_WIDTH * 0.6], [0, 1, 0]);

  return (
    <motion.div
      style={{ scale, opacity, filter: useTransform(brightness, (b) => `brightness(${b})`) }}
      className="relative group w-[300px] h-[400px] mx-5 rounded-3xl flex-shrink-0"
    >
      {/* Glow naranja solo en tarjeta central */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none z-0"
        style={{
          opacity: glowOpacity,
          boxShadow: "0 0 40px 8px rgba(255,102,0,0.35), 0 0 0 1px rgba(255,102,0,0.6)",
        }}
      />

      <div className="relative z-10 w-full h-full bg-[#0A0A0A] rounded-3xl p-6 flex flex-col border border-white/5 group-hover:border-[#FF6600]/60 transition-colors duration-300">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none" />

        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-white/60 uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
              Categoría
            </span>
            <h4 className="text-white font-bold text-lg tracking-wide" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
              {mat.category}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#111] flex items-center justify-center text-orange-500 shadow-md border border-white/5 transition-all duration-300 group-hover:bg-[#FF6600] group-hover:text-white group-hover:shadow-[0_0_15px_rgba(255,102,0,0.4)]">
            {mat.icon}
          </div>
        </div>

        <div className="relative aspect-video w-full flex items-center justify-center p-4 mb-4 bg-gradient-to-b from-[#111] to-[#0A0A0A] rounded-2xl border border-white/5 group-hover:border-white/10 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <img
            src={mat.img}
            alt={mat.category}
            loading="lazy"
            decoding="async"
            width={240}
            height={135}
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
            className="relative z-10 max-w-[85%] max-h-[85%] w-auto h-auto object-contain filter drop-shadow-2xl opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500 ease-out select-none"
          />
        </div>

        <div className="flex flex-col gap-3 relative z-10 flex-1 overflow-y-auto no-scrollbar">
          {mat.items.map((item, idx) => (
            <div key={idx} className="flex flex-col pb-3 border-b border-dashed border-white/5 last:border-0">
              <span className="text-sm font-medium text-white/80 leading-snug group-hover:text-white transition-colors" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                {item.name}
              </span>
              {item.spec && <LEDSpec spec={item.spec} />}
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 right-4 text-[9px] font-mono text-white/10 pointer-events-none">
          PRT-{String(index % materials.length).padStart(2, "0")}
        </div>
      </div>
    </motion.div>
  );
});

// ── Cover Flow Carousel con bucle infinito + Auto-Play ────────────
const MaterialCarousel = memo(({ items }: { items: typeof materials }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const x = useMotionValue(0);
  const controls = useAnimationControls();

  const singleSetWidth = items.length * CARD_WIDTH;

  // ── Centra la primera tarjeta del set MEDIO en el viewport ────
  // Set medio empieza en index = items.length
  // Centro de la primera tarjeta del set medio = singleSetWidth + CARD_WIDTH/2
  // Queremos que ese punto quede en containerWidth/2
  // x = containerWidth/2 - (singleSetWidth + CARD_WIDTH/2)
  const initialOffset = containerWidth / 2 - singleSetWidth - CARD_WIDTH / 2;

  // Medir contenedor
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Aplicar offset inicial
  useEffect(() => {
    if (containerWidth > 0) {
      x.set(initialOffset);
    }
  }, [containerWidth, initialOffset]);

  // ── Teletransporte silencioso ─────────────────────────────────
  useMotionValueEvent(x, "change", (latest) => {
    // Si nos fuimos demasiado a la derecha (hacia el set 1), saltar al set 2
    if (latest > initialOffset + singleSetWidth) {
      x.set(latest - singleSetWidth);
    }
    // Si nos fuimos demasiado a la izquierda (hacia el set 3), saltar al set 2
    if (latest < initialOffset - singleSetWidth) {
      x.set(latest + singleSetWidth);
    }
  });

  // ── Auto-Play ─────────────────────────────────────────────────
  const scrollToNext = useCallback(() => {
    controls.start({
      x: x.get() - CARD_WIDTH,
      transition: { ease: "easeInOut", duration: 0.8 },
    });
  }, [x, controls]);

  useEffect(() => {
    if (isInteracting || containerWidth === 0) return;
    const intervalId = setInterval(scrollToNext, 2500);
    return () => clearInterval(intervalId);
  }, [isInteracting, containerWidth, scrollToNext]);

  // ── Snapping magnético en onDragEnd ──────────────────────────
  const handleDragEnd = useCallback((_: unknown, info: { velocity: { x: number }; offset: { x: number } }) => {
    const velocity = info.velocity.x;
    const projected = x.get() + velocity * 0.12;
    // Offset desde el centro del set medio
    const offsetFromCenter = projected - initialOffset;
    const closestIndex = Math.round(-offsetFromCenter / CARD_WIDTH);
    const snappedX = initialOffset - closestIndex * CARD_WIDTH;

    controls.start({
      x: snappedX,
      transition: { type: "spring", stiffness: 280, damping: 32, mass: 0.9, velocity },
    });
  }, [x, initialOffset, controls]);

  const handleInteractionStart = useCallback(() => setIsInteracting(true), []);
  const handleInteractionEnd   = useCallback(() => setIsInteracting(false), []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden py-10 cursor-grab active:cursor-grabbing"
      style={{ userSelect: "none" }}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onPointerDown={handleInteractionStart}
      onPointerUp={handleInteractionEnd}
      onPointerCancel={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
    >
      {/* Degradados laterales */}
      <div className="absolute left-0 top-0 bottom-0 w-28 md:w-48 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-28 md:w-48 bg-gradient-to-l from-[#050505] via-[#050505]/90 to-transparent z-20 pointer-events-none" />

      {/* Track: empieza en x=0 del contenedor, el offset lo maneja `x` ── */}
      <motion.div
        className="flex w-max"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -Infinity, right: Infinity }}
        dragElastic={0.05}
        dragTransition={{ power: 0.3, timeConstant: 200 }}
        animate={controls}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: "grabbing" }}
      >
        {tripledMaterials.map((mat, index) => (
          <MaterialCard
            key={`${mat.category}-${index}`}
            mat={mat}
            index={index}
            motionX={x}
            containerWidth={containerWidth}
          />
        ))}
      </motion.div>

      <DragHint />
    </div>
  );
});

// ── Drag hint pill — shown once, fades away ───────────────────────
const DragHint = memo(() => (
  <motion.div
    className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full pointer-events-none z-30"
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, 0] }}
    transition={{
      duration: 3.5,
      delay: 0.8,
      times: [0, 0.2, 0.7, 1],
      ease: "easeInOut",
      repeat: 0,
    }}
  >
    <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8M8 12h8M8 17h8" />
    </svg>
    <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Arrastra para explorar</span>
  </motion.div>
));

// ── Main Section ──────────────────────────────────────────────────
const ProcessSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const activeStep = useCyclingSteps(steps.length, isInView);

  return (
    <section id="proceso" ref={sectionRef} className="py-24 bg-[#050505] overflow-hidden relative" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center mb-16 text-center">
          <motion.span custom={0} variants={headerVariants} initial="hidden" animate={isInView ? "visible" : "hidden"} className="text-orange-500 font-medium text-sm tracking-widest uppercase inline-block mb-3">
            Nuestro Proceso
          </motion.span>
          <motion.h2 custom={1} variants={headerVariants} initial="hidden" animate={isInView ? "visible" : "hidden"} className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Diferenciadores Técnicos
          </motion.h2>
          <motion.p custom={2} variants={headerVariants} initial="hidden" animate={isInView ? "visible" : "hidden"} className="mt-4 text-white/40 max-w-2xl font-light">
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
              <h3 className="font-bold text-xl mb-3 text-white">{step.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Materials */}
        <div className="mt-40">
          <div className="flex flex-col items-center mb-16 text-center">
            <motion.span custom={0} variants={headerVariants} initial="hidden" animate={isInView ? "visible" : "hidden"} className="text-orange-500 font-medium text-sm tracking-widest uppercase inline-block mb-3">
              Materiales Premium
            </motion.span>
            <motion.h3 custom={1} variants={headerVariants} initial="hidden" animate={isInView ? "visible" : "hidden"} className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Insumos de Alta Gama
            </motion.h3>
            <motion.p custom={2} variants={headerVariants} initial="hidden" animate={isInView ? "visible" : "hidden"} className="mt-4 text-white/40 max-w-2xl font-light">
              Selección rigurosa de compuestos térmicos y químicos de grado industrial para garantizar la máxima eficiencia de tu hardware.
            </motion.p>
          </div>

          {/* ── Physical drag carousel ── */}
          <MaterialCarousel items={materials} />

          <p className="text-center text-sm text-white/50 mt-6 tracking-[0.05em] font-medium max-w-lg mx-auto">
            Todos los materiales son de grado profesional y seleccionados por su rendimiento térmico superior.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes ledFlicker { 0%,100%{opacity:1} 30%{opacity:0.2} 50%{opacity:1} 70%{opacity:0.4} 90%{opacity:1} }
        .led-flicker { animation: ledFlicker 1.2s ease-in-out 1; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default ProcessSection;
