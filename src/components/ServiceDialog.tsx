import { X, Zap, MessageCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";

// --- Data Constants ---

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
    "Situar nuevos pads térmicos (Extreme Odyssey II) (14.8 w/mK)",
    "Aplicar nueva Masilla térmica UTP-8 Upsiren (14.8 w/mK)",
  ],
};

const dialogData: Record<string, { title: string; tiers: { name: string; price: string; subtitle?: string; items: string[]; note?: string; isPads?: boolean }[] }> = {
  "pc-gamer": {
    title: "Limpieza de PC",
    tiers: [
      { name: "BÁSICO", price: "S/. 65", subtitle: "Mantenimiento Preventivo", items: ["Limpieza de polvo", "Re-aplicación de pasta térmica (TF8 13.8 w/mK) / (MX4 8.5 w/mK)", "Encerado mate"] },
      { name: "PROFUNDO", price: "S/. 100 a 250", subtitle: "Mantenimiento Correctivo", items: ["Desmantelar (todos los componentes)", "Limpieza profunda (todos los componentes)", "Lavado químico", "Descontaminado", "Re-ensamble de PC", "Re-aplicar pasta térmica (TF8 13.8 w/mK) / (MX4 8.5 w/mK)", "Gestión de cables", "Encerado mate", "Lubricado"], note: "Excepto la GPU" },
    ],
  },
  gpu: {
    title: "Limpieza de GPU",
    tiers: [
      { name: "BÁSICO", price: "S/. 25", subtitle: "Mantenimiento Preventivo", items: ["Limpieza de polvo", "Encerado mate"] },
      { name: "PROFUNDO", price: "S/. 50 a 150", subtitle: "Mantenimiento Correctivo", items: ["Desmantelar GPU", "Limpieza profunda GPU", "Lavado químico", "Descontaminado", "Re-aplicar pasta térmica (TF8 13.8 w/mK) / (MX4 8.5 w/mK)", "Re-ensamble de GPU", "Lubricado de ventiladores", "Encerado mate"], note: "No incluye pads térmicos" },
      PADS_TIER,
    ],
  },
  laptops: {
    title: "Limpieza de Laptop",
    tiers: [
      { name: "LAPTOP", price: "S/. 80 a 150", subtitle: "Mantenimiento para Laptop", items: ["Desmantelar laptop", "Limpieza profunda", "Lavado químico", "Descontaminado", "Re-aplicar pasta térmica (TF8 13.8 w/mK) / (MX4 8.5 w/mK)", "Re-ensamble de laptop", "Calibración & lubricado de bisagras", "Limpieza de teclado & touchpad", "Limpieza de pantalla", "Encerado mate"], note: "No incluye pads térmicos" },
      PADS_TIER,
    ],
  },
  macbook: {
    title: "Limpieza de MacBook",
    tiers: [
      { name: "MACBOOK", price: "S/. 100 a 150", subtitle: "Mantenimiento para MacBook", items: ["Desmantelar MacBook", "Limpieza profunda", "Lavado químico", "Descontaminado", "Re-aplicar pasta térmica (TF8 13.8 w/mK) / (MX4 8.5 w/mK)", "Re-ensamble de MacBook", "Limpieza de teclado & touchpad", "Encerado mate", "Limpieza de pantalla"] },
    ],
  },
  consoles: {
    title: "Limpieza de Consola",
    tiers: [
      { name: "CONSOLA", price: "S/. 70 a 150", subtitle: "Mantenimiento de PS4 / PS5 / Xbox", items: ["Desmantelar consola", "Limpieza profunda", "Lavado químico", "Descontaminado", "Re-aplicar pasta térmica (TF8 13.8 w/mK) / (MX4 8.5 w/mK)", "Re-ensamble de consola", "Encerado mate"], note: "No incluye pads térmicos" },
      PADS_TIER,
    ],
  },
  upgrade: {
    title: "Otros Servicios",
    tiers: [
      { name: "ENSAMBLE PC", price: "Desde S/. 70", items: ["Ensamble de componentes", "Componentes del cliente", "Gestión de cables", "Encerado mate"] },
      { name: "ENSAMBLE PERSONALIZADO", price: "Desde S/. 100", items: ["Ensamble personalizado según necesidad", "Asesoría de componentes", "Cotización", "Ensamble", "Gestión de cables", "Encerado mate", "Optimización del sistema operativo", "Windows & Office permanente"] },
      { name: "DIAGNÓSTICO & REPARACIÓN", price: "Desde S/. 50", items: ["Diagnóstico & reparación de PC y laptop", "Descarte de fallas en componentes (PC)", "Pruebas de estrés en componentes (PC)", "Reparación de teclado, batería, pantalla, disco (laptop)", "Recuperación de datos", "Bypass de contraseña en Windows"] },
      { name: "HARDWARE & SOFTWARE", price: "Desde S/. 30", items: ["Instalación de componentes (CPU, FANs, MOBO, PSU, GPU, etc.)", "Instalación de programas", "Formateo (software)", "Optimización de sistema operativo", "Windows & Office & Adobe permanente", "Programas (SketchUp, AutoCAD, etc.)"] },
    ],
  },
};

// ── HIGHLIGHT KEYWORDS — animated glow on thermal specs ──────────
const highlightKeywords = (text: string | React.ReactNode): React.ReactNode => {
  if (typeof text !== "string") return text;
  // Corrected regex — matches e.g. "14.8 w/mK", "13.8 w/mK", "79 w/mK"
  const specRegex = /(\d+(?:\.\d+)?\s?w\/mK)/gi;
  const parts = text.split(specRegex);
  if (parts.length > 1) {
    return (
      <span>
        {parts.map((part, i) => {
          if (!part) return null;
          if (specRegex.test(part)) {
            // Reset lastIndex after test()
            specRegex.lastIndex = 0;
            return (
              <motion.span
                key={i}
                className="text-xs italic font-mono ml-1 text-orange-400/90"
                animate={{
                  textShadow: [
                    "0 0 0px rgba(249,115,22,0)",
                    "0 0 8px rgba(249,115,22,0.75)",
                    "0 0 0px rgba(249,115,22,0)",
                  ],
                }}
                transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, delay: i * 0.4 }}
              >
                {part.trim()}
              </motion.span>
            );
          }
          specRegex.lastIndex = 0;
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  }
  return text;
};

// ── VARIANTS ──────────────────────────────────────────────────────

// 1. Progressive backdrop blur (0px → 12px)
const backdropVariants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: {
    opacity: 1,
    backdropFilter: "blur(12px)",
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: { duration: 0.3, delay: 0.05 },
  },
};

// 2. Elastic out — bouncy spring entrance from bottom
const panelVariants = {
  hidden: { opacity: 0, y: 90, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
      mass: 0.9,
    },
  },
  exit: {
    opacity: 0, y: 50, scale: 0.97,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

const tierContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const tierVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// 3. Stagger 0.1s between list items
const listContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -14 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.38, ease: "easeOut" as const },
  },
};

// ── TIER DESCRIPTION FADE-IN VARIANT ─────────────────────────────
const descVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: 0.25 + i * 0.07 },
  }),
};

// ── ANIMATED CHECK ICON (draw-on effect) ─────────────────────────
const AnimatedCheck = ({ orange }: { orange?: boolean }) => (
  <motion.svg
    width="14" height="14" viewBox="0 0 14 14" fill="none"
    className="shrink-0 mt-[3px]"
    initial="hidden"
    animate="visible"
  >
    <motion.circle
      cx="7" cy="7" r="6"
      stroke={orange ? "rgba(249,115,22,0.5)" : "rgba(255,255,255,0.12)"}
      strokeWidth="1"
      variants={{
        hidden: { pathLength: 0, opacity: 0 },
        visible: { pathLength: 1, opacity: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
      }}
    />
    <motion.path
      d="M4 7l2 2 4-4"
      stroke={orange ? "rgb(249,115,22)" : "rgba(255,255,255,0.45)"}
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      variants={{
        hidden: { pathLength: 0, opacity: 0 },
        visible: { pathLength: 1, opacity: 1, transition: { duration: 0.35, ease: "easeOut" as const, delay: 0.2 } },
      }}
    />
  </motion.svg>
);

// ── PADS BREATH BORDER ────────────────────────────────────────────
const PadsBreathBorder = () => (
  <motion.div
    className="absolute inset-0 rounded-2xl pointer-events-none"
    animate={{
      boxShadow: [
        "0 0 0px 0px rgba(249,115,22,0)",
        "0 0 12px 2px rgba(249,115,22,0.3)",
        "0 0 0px 0px rgba(249,115,22,0)",
      ],
      borderColor: [
        "rgba(249,115,22,0.1)",
        "rgba(249,115,22,0.5)",
        "rgba(249,115,22,0.1)",
      ],
    }}
    transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity }}
    style={{ border: "1px solid rgba(249,115,22,0.1)", borderRadius: "1rem" }}
  />
);

// ── CTA BUTTON WITH SHINE + ENTRY PULSE ──────────────────────────
const CTAButton = ({ href, title }: { href: string; title: string }) => {
  const shineControls = useAnimationControls();
  const buttonControls = useAnimationControls();
  const hasPulsed = useRef(false);

  // Entry pulse on mount
  useEffect(() => {
    if (hasPulsed.current) return;
    hasPulsed.current = true;
    const timer = setTimeout(async () => {
      await buttonControls.start({
        scale: 1.02,
        transition: { duration: 0.18, ease: "easeOut" },
      });
      await buttonControls.start({
        scale: 1,
        transition: { duration: 0.22, ease: "easeIn" },
      });
    }, 600); // slight delay after modal opens
    return () => clearTimeout(timer);
  }, [buttonControls]);

  // Shine sweep every 4s
  useEffect(() => {
    const runShine = async () => {
      await shineControls.start({
        x: ["−100%", "220%"],
        transition: { duration: 0.75, ease: "easeInOut" },
      });
    };
    runShine();
    const id = setInterval(runShine, 4000);
    return () => clearInterval(id);
  }, [shineControls]);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      animate={buttonControls}
      className="group relative flex items-center justify-center gap-3 w-full bg-orange-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-[0_4px_20px_rgba(249,115,22,0.2)] overflow-hidden"
      style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
      whileHover={{
        backgroundColor: "#ff6600",
        y: -2,
        boxShadow: "0 10px 35px rgba(249,115,22,0.4)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* Shine overlay */}
      <motion.span
        animate={shineControls}
        className="absolute inset-y-0 w-16 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%)",
          left: "-4rem",
          skewX: "-12deg",
        }}
      />
      <MessageCircle className="w-5 h-5 fill-white text-white relative z-10" />
      <span className="uppercase tracking-widest text-xs relative z-10">Agendar por WhatsApp</span>
    </motion.a>
  );
};

// ── COMPONENT ─────────────────────────────────────────────────────
interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  serviceId: string | null;
}

const ServiceDialog = ({ open, onClose, serviceId }: ServiceDialogProps) => {
  const data = serviceId ? dialogData[serviceId] : null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!mounted || !data) return null;

  const whatsappHref = `https://wa.me/51940755119?text=Hola%20QuickFix%2C%20estoy%20interesado%20en%20el%20servicio%20de%20${encodeURIComponent(data.title)}.%20%C2%BFMe%20podr%C3%ADan%20brindar%20m%C3%A1s%20detalles%3F`;

  return createPortal(
    <AnimatePresence mode="wait">
      {open && (
        <>
          {/* Backdrop — progressive blur */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/50"
          />

          {/* Panel wrapper */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="panel"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0f0f0f] border border-white/5 rounded-3xl shadow-2xl pointer-events-auto overflow-hidden"
              style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
            >
              {/* Top orange accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent z-30" />

              <div className="overflow-y-auto custom-scrollbar flex flex-col h-full">

                {/* Header */}
                <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-6 bg-[#0f0f0f]/95 backdrop-blur-xl border-b border-white/5 shrink-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Detalle del Servicio</span>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{data.title}</h2>
                  </div>
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.12)" }}
                    whileTap={{ scale: 0.92 }}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Tier cards */}
                <motion.div
                  className="p-6 space-y-4"
                  variants={tierContainerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {data.tiers.map((tier) => {
                    const isPads = tier.isPads;
                    return (
                      // 3. PADS tier — breath border wrapper
                      <motion.div
                        key={tier.name}
                        variants={tierVariants}
                        className={`relative rounded-2xl overflow-hidden ${
                          isPads
                            ? "border border-orange-500/10 bg-orange-500/[0.03]"
                            : "border border-white/5 bg-white/[0.02]"
                        }`}
                      >
                        {isPads && <PadsBreathBorder />}

                        {/* Tier header */}
                        <div className={`flex items-start md:items-center justify-between px-5 py-4 ${
                          isPads ? "bg-gradient-to-r from-orange-500/10 to-transparent" : "bg-gradient-to-b from-white/5 to-transparent"
                        } flex-col md:flex-row gap-4`}>
                          <div className="flex items-center gap-3">
                            {isPads && <Zap className="w-4 h-4 text-orange-500/80 shrink-0 fill-orange-500/10" />}
                            <div>
                              <p className="text-base font-bold text-white">{tier.name}</p>
                              {tier.subtitle && (
                                <motion.p
                                  custom={0}
                                  variants={descVariants}
                                  initial="hidden"
                                  animate="visible"
                                  className="text-xs text-white/40 mt-0.5 font-normal"
                                >
                                  {tier.subtitle}
                                </motion.p>
                              )}
                            </div>
                          </div>

                          {/* Price pill */}
                          <motion.span
                            className={`text-sm font-bold tracking-wide px-3 py-1 rounded-full whitespace-nowrap ${
                              isPads
                                ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                : "bg-white/5 text-white/80 border border-white/5"
                            }`}
                            animate={isPads ? {
                              boxShadow: ["0 0 0px rgba(249,115,22,0)", "0 0 10px rgba(249,115,22,0.35)", "0 0 0px rgba(249,115,22,0)"],
                            } : {}}
                            transition={isPads ? { duration: 2.5, ease: "easeInOut", repeat: Infinity } : {}}
                          >
                            {tier.price}
                          </motion.span>
                        </div>

                        {/* Items list — staggered draw-on checks */}
                        <div className="px-5 py-5">
                          <motion.ul
                            className="space-y-3"
                            variants={listContainerVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            {tier.items.map((item) => (
                              <motion.li
                                key={item}
                                variants={listItemVariants}
                                className="flex items-start gap-3"
                              >
                                <AnimatedCheck orange={isPads} />
                                <span className="text-[14px] leading-relaxed text-white/70 font-normal">
                                  {highlightKeywords(item)}
                                </span>
                              </motion.li>
                            ))}
                          </motion.ul>
                          {tier.note && (
                            <p className="text-xs text-white/30 mt-4 pt-4 border-t border-white/5 italic flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-orange-500 inline-block" />
                              {tier.note}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Footer CTA */}
                <div className="sticky bottom-0 px-6 py-6 bg-[#0f0f0f] border-t border-white/5 shrink-0 z-20 mt-auto">
                  <CTAButton href={whatsappHref} title={data.title} />
                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ServiceDialog;

// ── SCROLLBAR STYLE ───────────────────────────────────────────────
const _style = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 20px; }
`;
if (typeof document !== "undefined") {
  const el = document.getElementById("dialog-scrollbar-style") ?? document.createElement("style");
  el.id = "dialog-scrollbar-style";
  el.textContent = _style;
  if (!document.getElementById("dialog-scrollbar-style")) document.head.appendChild(el);
}
