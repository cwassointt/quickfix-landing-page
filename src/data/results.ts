/**
 * Temperaturas medidas antes y después del mantenimiento (capturas de HWiNFO o similar).
 * Para completar un caso: pon las temperaturas en °C y las capturas en public/resultados/.
 * Mientras falten, la web muestra el hueco marcado como pendiente (nunca números inventados).
 */
export type Result = {
  model: string;
  service: string;
  before?: number;
  after?: number;
  imageBefore?: string;
  imageAfter?: string;
};

export const results: Result[] = [
  { model: "ASUS ROG Strix G16", service: "Paquete ROG con metal líquido" },
  { model: "ASUS ROG Zephyrus G14", service: "Masilla térmica y metal líquido" },
  { model: "Lenovo Legion Pro 7", service: "Masilla térmica y metal líquido" },
];
