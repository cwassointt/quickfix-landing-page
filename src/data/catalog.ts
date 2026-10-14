// Única fuente de precios: cotizador, tarjetas de servicios y FAQ leen de aquí.
// Precios en soles (PEN).

/** Extras con el mismo `group` se excluyen entre sí (ej. metal líquido 1 o 2 chips). */
export type Extra = { id: string; name: string; price: number; group?: string };

export type Service = {
  id: string;
  name: string;
  detail: string;
  price: number;
  /** Precio tachado, para paquetes en promoción. */
  regularPrice?: number;
  extras?: Extra[];
  /** Precio de la GPU cuando se hace junto con una PC gamer. */
  comboPrice?: number;
  /** PC que permite sumar la GPU con precio de combo. */
  gpuCombo?: boolean;
};

export type Category = { id: string; name: string; services: Service[] };

const pads = (price: number, name = "Pads térmicos"): Extra => ({ id: "pads", name, price });
const putty = (price: number): Extra => ({ id: "pads", name: "Masilla térmica", price });

export const maintenance: Category[] = [
  {
    id: "laptops",
    name: "Laptops",
    services: [
      {
        id: "asus-rog",
        name: "ASUS ROG · Paquete completo",
        detail: "Limpieza profunda + pads térmicos + metal líquido",
        price: 335,
        regularPrice: 350,
      },
      { id: "laptop-oficina", name: "Laptop de oficina", detail: "Sin tarjeta gráfica", price: 70 },
      { id: "laptop-oficina-gpu", name: "Laptop de oficina con gráfica", detail: "Procesador + tarjeta gráfica", price: 85, extras: [putty(45)] },
      { id: "laptop-gamer", name: "Laptop gamer", detail: "Gama de entrada y media", price: 135, extras: [putty(90)] },
      {
        id: "laptop-gamer-pro",
        name: "Laptop gamer avanzada",
        detail: "Gama alta",
        price: 150,
        extras: [
          putty(120),
          { id: "metal-1", name: "Metal líquido · 1 chip", price: 80, group: "metal" },
          { id: "metal-2", name: "Metal líquido · 2 chips", price: 150, group: "metal" },
        ],
      },
    ],
  },
  {
    id: "pcs",
    name: "PC de escritorio",
    services: [
      { id: "pc-oficina", name: "PC de oficina", detail: "Sin tarjeta gráfica", price: 70, extras: [pads(35, "Pads térmicos VRM")] },
      { id: "pc-gamer", name: "PC gamer", detail: "Torre compacta o mediana", price: 120, extras: [pads(65, "Pads térmicos VRM")], gpuCombo: true },
      { id: "pc-gamer-grande", name: "PC gamer grande", detail: "Full tower / alta gama", price: 220, extras: [pads(90, "Pads térmicos VRM")], gpuCombo: true },
    ],
  },
  {
    id: "gpus",
    name: "Tarjetas gráficas",
    services: [
      { id: "gpu-2fan", name: "Tarjeta gráfica", detail: "1 o 2 ventiladores · hasta RTX 3060 / 4060 / 5060", price: 60, comboPrice: 48 },
      { id: "gpu-3fan", name: "Tarjeta gráfica", detail: "3 ventiladores · hasta RTX 3060 / 4060 / 5060", price: 90, comboPrice: 72 },
      { id: "gpu-alta", name: "Tarjeta gráfica de gama alta", detail: "RTX 3070 / 4070 / 5070 o superior", price: 135 },
    ],
  },
  {
    id: "macbook",
    name: "MacBook",
    services: [
      { id: "macbook-pro", name: "MacBook Pro", detail: "Todos los modelos Pro", price: 190 },
      { id: "macbook", name: "MacBook", detail: "Air y demás modelos", price: 150 },
    ],
  },
  {
    id: "consolas",
    name: "Consolas",
    services: [
      { id: "ps4", name: "PlayStation 4", detail: "", price: 110, extras: [pads(50)] },
      {
        id: "ps5",
        name: "PlayStation 5",
        detail: "",
        price: 140,
        extras: [pads(100), { id: "metal", name: "Metal líquido", price: 80 }],
      },
    ],
  },
];

/** Precio del diagnóstico; la reparación se cotiza después de revisar el equipo. */
export const diagnosis: Service[] = [
  { id: "diag-general", name: "Diagnóstico de hardware y software", detail: "Encontramos qué falla en tu equipo", price: 60 },
  { id: "diag-electronico", name: "Diagnóstico electrónico", detail: "Revisión a nivel de placa · 1 a 2 días", price: 99 },
];

/** Qué incluye el mantenimiento de cada tipo de equipo (sección Servicios). */
export const includes: Record<string, string[]> = {
  laptops: ["Desarmado completo", "Lavado químico y descontaminado", "Pasta Thermalright TF8 (13.8 W/mK)", "Bisagras calibradas y lubricadas", "Limpieza de teclado y pantalla", "Encerado mate"],
  pcs: ["Desarmado de todos los componentes", "Lavado químico y descontaminado", "Pasta Thermalright TF8 (13.8 W/mK)", "Gestión de cables", "Ventiladores lubricados", "Encerado mate"],
  gpus: ["Desarmado de la tarjeta", "Lavado químico y descontaminado", "Pasta Thermalright TF8 (13.8 W/mK)", "Ventiladores lubricados", "Encerado mate"],
  macbook: ["Desarmado completo", "Lavado químico y descontaminado", "Pasta térmica nueva", "Limpieza de teclado y pantalla", "Encerado mate"],
  consolas: ["Desarmado completo", "Lavado químico y descontaminado", "Pasta térmica nueva", "Encerado mate"],
};

/** Reparación a nivel de placa: precio desde, después del diagnóstico electrónico. */
export const repairs = [
  {
    id: "gpu",
    name: "Tarjetas gráficas",
    detail: "RTX 3060 en adelante",
    from: 299,
    days: "3 a 4 días",
    work: ["Reballing y cambio de memorias VRAM", "Cortos en fases de poder (MOSFET / VRM)", "BIOS y pistas dañadas", "Puertos HDMI y DisplayPort"],
  },
  {
    id: "laptop-gamer",
    name: "Laptops gamer",
    detail: "ASUS ROG, TUF, Lenovo LOQ y similares",
    from: 399,
    days: "2 a 4 días",
    work: ["Placas en corto o con humedad", "Circuito de carga y encendido", "Chip KBC / Super I/O", "Daños por derrame de metal líquido"],
  },
  {
    id: "laptop-oficina",
    name: "Laptops de oficina",
    detail: "HP, Acer, Lenovo y similares",
    from: 199,
    days: "2 a 4 días",
    work: ["Equipos que no encienden", "Salida de video y retroiluminación", "Puertos USB-C, USB y de carga", "Lavado químico por derrame"],
  },
];

/** Otros trabajos, cotizados por WhatsApp. */
export const others = [
  { name: "Ensamble de PC", detail: "Con tus componentes y gestión de cables", from: 70 },
  { name: "Ensamble a medida", detail: "Te asesoro en las piezas y lo armo", from: 100 },
  { name: "Instalación y software", detail: "Componentes, formateo y optimización", from: 30 },
];

/** Servicio a domicilio: visita fija + movilidad según el distrito. */
export const homeVisit = {
  fee: 50,
  zones: [
    { price: 15, districts: ["San Miguel", "La Perla", "Magdalena"] },
    { price: 25, districts: ["San Isidro", "Pueblo Libre", "Miraflores", "Lince", "Barranco", "San Borja", "Surquillo", "Jesús María", "La Victoria"] },
    { price: 35, districts: ["Chorrillos", "La Molina", "Surco"] },
  ],
};

export const warranty = { thermalMonths: 6, rogMaterialsYears: 2 };
