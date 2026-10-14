import { ImageIcon } from "lucide-react";

/**
 * Hueco para una foto que aún no existe. Dice qué foto va, para reemplazarla luego por un <img>.
 * shortcut: es un marcador visible, reemplazar por la foto real antes de publicar.
 */
const MockImage = ({ label, className = "" }: { label: string; className?: string }) => (
  <div role="img" aria-label={`Imagen pendiente: ${label}`} className={`relative grid place-items-center bg-[#151515] text-center p-6 ${className}`}>
    <div className="max-w-[26ch]">
      <ImageIcon className="mx-auto w-7 h-7 text-white/25" aria-hidden="true" />
      <p className="mt-3 text-sm text-white/40">Foto pendiente</p>
      <p className="mt-1 text-white/60">{label}</p>
    </div>
  </div>
);

export default MockImage;
