import { motion, useReducedMotion } from "framer-motion";
import MockImage from "@/components/MockImage";
import OptimizedImage from "@/components/OptimizedImage";

import grizzlyImg from "../images/materials/GRIZZLY.webp";
import utp8Img from "../images/materials/UTP8.webp";
import tf8Img from "../images/materials/TF8.webp";
import odysseyImg from "../images/materials/ODDYSEY.webp";
import vistonyImg from "../images/materials/VISTONY.webp";
import m950Img from "../images/materials/950.webp";
import b4Img from "../images/materials/B4QUICKFIX.webp";

const steps = [
  { title: "Lavado químico", desc: "Soluciones especializadas que sacan el polvo y la grasa sin dañar ningún componente." },
  { title: "Descontaminado", desc: "Retira residuos microscópicos y oxidación de la placa y los disipadores." },
  { title: "Pasta, masilla o metal líquido", desc: "Aplicación de compuestos de alta conductividad según tu equipo, para bajar varios grados." },
  { title: "Encerado mate", desc: "Un acabado que protege el chasis y deja tu equipo con aspecto de fábrica." },
];

const materials = [
  { category: "Metal líquido", name: "Thermalright Silver King · Thermal Grizzly", spec: "hasta 79 W/mK", img: grizzlyImg },
  { category: "Masilla térmica", name: "UTP-8 Upsiren", spec: "14.8 W/mK", img: utp8Img },
  { category: "Pasta térmica", name: "Thermalright TF8 · Arctic MX-4", spec: "13.8 W/mK", img: tf8Img },
  { category: "Pads térmicos", name: "Thermalright Extreme Odyssey II", spec: "14.8 W/mK", img: odysseyImg },
  { category: "Lavado", name: "Vistony limpiador de contactos", spec: null, img: vistonyImg },
  { category: "Descontaminado", name: "Mechanic 950 · Arctic MX Cleaner", spec: null, img: m950Img },
  { category: "Encerado", name: "QuickFix B4 Premium Matte", spec: null, img: b4Img },
];

const ProcessSection = () => {
  const reduce = useReducedMotion();
  const rise = (i = 0) => ({
    initial: { opacity: 0, transform: reduce ? "none" : "translateY(24px)" },
    whileInView: { opacity: 1, transform: "translateY(0px)" },
    viewport: { once: true, amount: 0.2 },
    transition: { type: "spring" as const, bounce: 0, duration: 0.7, delay: i * 0.08 },
  });

  return (
    <section id="proceso" className="bg-[#050505] py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <motion.h2 {...rise()} className="text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-white md:text-7xl">
              Ves cada paso por WhatsApp
            </motion.h2>
            <motion.p {...rise(1)} className="mt-6 max-w-[48ch] text-lg text-white/80 md:text-xl">
              Cada equipo lo trabajo yo, Gianluca. Mientras lo hago te mando fotos y videos, para que sepas exactamente qué se le hizo a tu máquina.
            </motion.p>

            <ol className="mt-14 space-y-10">
              {steps.map((s, i) => (
                <motion.li key={s.title} {...rise(i)} className="max-w-[52ch]">
                  <h3 className="text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">{s.title}</h3>
                  <p className="mt-2 text-lg text-white/70">{s.desc}</p>
                </motion.li>
              ))}
            </ol>
          </div>

          <motion.div {...rise(2)} className="lg:sticky lg:top-28 lg:self-start">
            <MockImage label="Video vertical: Gianluca aplicando metal líquido a una ASUS ROG Strix" className="aspect-[4/5] w-full rounded-3xl" />
          </motion.div>
        </div>

        <div className="mt-28 md:mt-36">
          <motion.h3 {...rise()} className="text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
            Los materiales que uso
          </motion.h3>
          <motion.p {...rise(1)} className="mt-3 max-w-[56ch] text-lg text-white/70">
            Marcas reconocidas y la conductividad real de cada una.
          </motion.p>
          <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {materials.map((m) => (
              <li key={m.category}>
                <div className="aspect-square overflow-hidden rounded-3xl bg-white">
                  <OptimizedImage src={m.img} alt={m.name} width={600} height={600} sizes="300px" className="h-full w-full object-contain p-6" />
                </div>
                <p className="mt-4 text-white/60">{m.category}</p>
                <p className="text-lg text-white">{m.name}</p>
                {m.spec && <p className="font-display text-2xl font-bold text-primary tabular-nums">{m.spec}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
