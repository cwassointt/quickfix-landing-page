import laptop from "./servicio-laptop.webp";
import laptop480 from "./servicio-laptop-480.webp";
import pc from "./servicio-pc.webp";
import pc480 from "./servicio-pc-480.webp";
import gpu from "./servicio-gpu.webp";
import gpu480 from "./servicio-gpu-480.webp";
import macbook from "./servicio-macbook.webp";
import macbook480 from "./servicio-macbook-480.webp";
import consola from "./servicio-consola.webp";
import consola480 from "./servicio-consola-480.webp";

/** Fotos de servicio (900 px) → srcset con su versión de 480 px, para que las tarjetas pequeñas no bajen la grande. */
export const SERVICE_SRCSETS: Record<string, string> = Object.fromEntries(
  [
    [laptop, laptop480],
    [pc, pc480],
    [gpu, gpu480],
    [macbook, macbook480],
    [consola, consola480],
  ].map(([big, small]) => [big, `${small} 480w, ${big} 900w`]),
);
