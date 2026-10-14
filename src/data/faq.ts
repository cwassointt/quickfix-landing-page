import { diagnosis } from "@/data/catalog";

const diagPrice = (id: string) => diagnosis.find((d) => d.id === id)!.price;

/** Cada respuesta es una lista de párrafos en texto plano. */
export const faq: { q: string; a: string[] }[] = [
  {
    q: "¿Cada cuánto debo hacer mantenimiento?",
    a: [
      "Depende del equipo y de dónde vives: en distritos costeros como San Miguel, Magdalena o Miraflores la humedad salina acelera la sulfatación.",
      "Laptop de oficina: cada 2 a 3 años. Laptop gamer con pasta: cada 1 a 2 años. Gama alta con metal líquido: revisión anual y cambio cada 2 años. PC de escritorio: una vez al año.",
    ],
  },
  {
    q: "¿Qué gano con metal líquido o masilla térmica?",
    a: [
      "La conductividad (W/mK) mide qué tan rápido pasa el calor del chip al disipador. Una pasta común como la Arctic MX-4 tiene 8.5 W/mK; la Thermalright TF8, 13.8 W/mK; el metal líquido, hasta 79 W/mK.",
      "En equipos gamer eso se traduce en 5 °C a 15 °C menos, sin caídas de rendimiento por temperatura y con más vida útil para la CPU y la GPU.",
    ],
  },
  {
    q: "¿Pierdo mis archivos con el mantenimiento?",
    a: ["No. El mantenimiento no toca tu disco ni tu información. Solo se formatea si lo pides como servicio aparte."],
  },
  {
    q: "¿Por qué atienden solo con cita?",
    a: [
      "Para dedicarle tiempo exclusivo a tu equipo, sin polvo cruzado entre máquinas, y explicarte el trabajo al recibirlo y al entregarlo. Con cita atiendo las 24 horas, todos los días.",
    ],
  },
  {
    q: "¿Van a domicilio?",
    a: [
      "Sí, a San Miguel, Magdalena, Pueblo Libre, Jesús María, Lince, San Isidro, Miraflores, San Borja, Surquillo, Surco, La Molina, Breña, La Victoria y Chorrillos. Para otros distritos, consulta por WhatsApp la movilidad.",
    ],
  },
  {
    q: `¿Por qué el diagnóstico electrónico cuesta S/ ${diagPrice("diag-electronico")}?`,
    a: [
      "Encontrar una falla de placa exige desarmar el equipo, estudiar sus planos eléctricos y medir con multímetro, osciloscopio y cámara térmica hasta dar con el componente exacto. Toma de 1 a 2 días y no es reembolsable.",
      `Si solo necesitas saber qué falla a nivel de hardware o software, el diagnóstico general cuesta S/ ${diagPrice("diag-general")}.`,
    ],
  },
  {
    q: "¿Cuánto tarda una reparación de placa?",
    a: ["Diagnóstico de 1 a 2 días, reparación de 2 a 4 días y 24 horas de pruebas de estrés antes de entregarte el equipo."],
  },
  {
    q: "Derramé líquido en mi laptop, ¿qué hago?",
    a: [
      "No la enciendas ni la conectes al cargador, y no uses secadora: empuja el líquido hacia adentro.",
      "Tráela cuanto antes. Lo primero es un lavado químico para detener la corrosión; después vemos qué se puede salvar.",
    ],
  },
  {
    q: "¿Cómo puedo pagar?",
    a: ["Yape, Plin, transferencia BCP o efectivo."],
  },
];
