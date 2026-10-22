import { diagnosis, warranty } from "@/data/catalog";
import { GA_ID } from "@/lib/analytics";

const electronic = diagnosis.find((d) => d.id === "diag-electronico")!.price;

export type LegalSection = { title: string; paragraphs: string[]; covers?: string[]; excludes?: string[] };
export type LegalDoc = { slug: string; title: string; description: string; intro: string; sections: LegalSection[]; closing: string };

export const warrantyDoc: LegalDoc = {
  slug: "garantia",
  title: "Garantía",
  description: `Garantía térmica de ${warranty.thermalMonths} meses en mantenimientos, 90 días en reparación de placa y 2 años en instalación. QuickFix, San Miguel, Lima.`,
  intro: "Cada servicio tiene su propia garantía. Si algo no quedó como esperabas, escríbeme por WhatsApp y lo reviso con prioridad.",
  sections: [
    {
      title: `Garantía térmica · ${warranty.thermalMonths} meses`,
      paragraphs: [
        `Todos los mantenimientos tienen ${warranty.thermalMonths} meses de garantía térmica. Si después del servicio las temperaturas no mejoran como se esperaba o el equipo baja su rendimiento por calor sin motivo, lo reviso sin costo.`,
        `En el paquete ASUS ROG con metal líquido, los materiales duran ${warranty.rogMaterialsYears} años.`,
      ],
      covers: ["Revisión prioritaria en el taller", "Reaplicación de materiales si hace falta"],
    },
    {
      title: "Reparación de placa · 90 días",
      paragraphs: ["Las reparaciones a nivel de componente tienen 90 días de garantía sobre la zona o el componente reparado (por ejemplo, circuito de carga, MOSFET o VRAM)."],
      excludes: [
        "Fallas futuras en circuitos distintos al reparado",
        "Variaciones de voltaje (cargadores genéricos) o nuevos derrames de líquido",
      ],
    },
    {
      title: "Instalación · 2 años",
      paragraphs: [
        "Cambios de piezas (teclados, pantallas, baterías) y ensamble de componentes tienen 2 años de garantía sobre la instalación: cualquier falla por mal montaje la corrijo sin costo.",
        "La garantía de la pieza en sí depende de su fabricante.",
      ],
    },
  ],
  closing: "La garantía se pierde si el equipo fue abierto por terceros, recibió golpes, líquidos o un mal uso eléctrico después del servicio.",
};

export const termsDoc: LegalDoc = {
  slug: "terminos",
  title: "Términos y condiciones",
  description: "Términos del servicio de mantenimiento y reparación de QuickFix: respaldo de datos, fallas preexistentes, metal líquido, equipos no recogidos y diagnóstico electrónico.",
  intro: "Al entregar tu equipo a QuickFix aceptas estos términos, válidos desde que recibo el equipo.",
  sections: [
    {
      title: "Respaldo de tu información",
      paragraphs: [
        "Haz una copia de seguridad antes de entregar tu equipo. El mantenimiento no toca tu disco, pero QuickFix no se responsabiliza por pérdida de datos, programas o archivos durante el mantenimiento, el diagnóstico o un formateo que pidas.",
      ],
    },
    {
      title: "Fallas preexistentes y ocultas",
      paragraphs: [
        "Asumo que las fallas que declaras al entregar el equipo son las únicas. Si al desarmarlo aparecen daños previos (placas fisuradas, flex rotos, sulfatación o cortos ocultos), QuickFix no se responsabiliza por las fallas que deriven de ellos.",
      ],
    },
    {
      title: "Metal líquido",
      paragraphs: [
        "El metal líquido se recomienda solo para equipos de gama alta. Lo aplico con aislamiento (conformal coating y barreras); si el equipo es manipulado después por ti o por otro técnico, la garantía se pierde.",
      ],
    },
    {
      title: "Equipos no recogidos",
      paragraphs: [
        "Si no recoges tu equipo dentro de los 30 días calendario desde que te aviso que está listo, se cobra almacenaje. Pasados los 60 días, QuickFix podrá disponer del equipo para cubrir los costos, según la ley vigente.",
      ],
    },
    {
      title: "Diagnóstico y reparación electrónica",
      paragraphs: [
        `El diagnóstico electrónico (S/ ${electronic}) cubre horas de trabajo e instrumentación de laboratorio y no se devuelve, sea el equipo reparable o no. Si apruebas la reparación conmigo, se descuenta del total.`,
        "En equipos con cortos severos o daños por líquido, aislar la falla puede hacer que la placa pierda funciones que aún tenía o deje de encender. QuickFix no se responsabiliza por daños propios de esa degradación.",
      ],
    },
    {
      title: "Venta de componentes",
      paragraphs: [
        "Los precios de la tienda de componentes son finales y en soles. QuickFix no emite boleta ni factura.",
        "El stock se actualiza una vez al día: antes de que pagues te confirmo por WhatsApp que el producto está disponible y su precio. Con tu pago compro el producto al proveedor y lo entrego en 24 a 48 horas, o en la fecha de llegada si está en tránsito. Si el proveedor no puede atender el pedido, te devuelvo el pago completo.",
        "La garantía del producto es la de su fabricante y yo me encargo del trámite. La instalación tiene la garantía de instalación de QuickFix.",
      ],
    },
  ],
  closing: GA_ID
    ? "Esta web usa Google Analytics para contar visitas y clics de forma anónima, sin datos personales. Para consultas sobre estos términos, escribe a quickfix.pe24@gmail.com."
    : "Para consultas sobre estos términos, escribe a quickfix.pe24@gmail.com.",
};

export const legalDocs = [warrantyDoc, termsDoc];
