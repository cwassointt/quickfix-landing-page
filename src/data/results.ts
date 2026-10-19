/**
 * Temperaturas reales al terminar la prueba de estrés FurMark 3D al 100%, antes y después del mantenimiento.
 * Fotos del interior en public/resultados/ (720×960, WebP).
 */
export type Temps = { cpu: number; gpu: number };
export type Result = {
  model: string;
  service: string;
  before: Temps;
  after: Temps;
  imageBefore: string;
  imageAfter: string;
};

export const STRESS_TEST = "FurMark 3D al 100%";

export const results: Result[] = [
  {
    model: "ASUS ROG Strix G16",
    service: "Paquete ROG con metal líquido",
    before: { cpu: 98, gpu: 89 },
    after: { cpu: 72, gpu: 59 },
    imageBefore: "/resultados/rog-strix-g16-antes.webp",
    imageAfter: "/resultados/rog-strix-g16-despues.webp",
  },
  {
    model: "ASUS ROG Zephyrus G14",
    service: "Masilla térmica y metal líquido",
    before: { cpu: 105, gpu: 97 },
    after: { cpu: 75, gpu: 66 },
    imageBefore: "/resultados/rog-zephyrus-g14-antes.webp",
    imageAfter: "/resultados/rog-zephyrus-g14-despues.webp",
  },
  {
    model: "Lenovo Legion Pro 7",
    service: "Masilla térmica y metal líquido",
    before: { cpu: 93, gpu: 85 },
    after: { cpu: 62, gpu: 58 },
    imageBefore: "/resultados/legion-pro-7-antes.webp",
    imageAfter: "/resultados/legion-pro-7-despues.webp",
  },
];

/** Mayor bajada medida (CPU o GPU) entre todos los casos, para el titular. */
export const maxDrop = Math.max(...results.flatMap((r) => [r.before.cpu - r.after.cpu, r.before.gpu - r.after.gpu]));
