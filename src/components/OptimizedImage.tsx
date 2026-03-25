import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width: number;
  priority?: boolean;
  breakpoints?: number[];
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  width, 
  priority = false, 
  className, 
  title, 
  style, 
  sizes, 
  breakpoints,
  ...props 
}) => {
  const isLocalhost = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('192.168')
  );
  
  // Actualizado a q_50 (Calidad fija 50%) para forzar compresión agresiva y eliminar advertencias de Lighthouse.
  const CLOUDINARY_BY_KEY: Record<string, string> = {
    "console-ps5": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_auto/q_50/console-ps5_ctyf97.webp",
    "laptopgamer-repair": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_auto/q_50/laptopgamer-repair_jdsfo1.webp",
    "laptopoffice-repair": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_auto/q_50/laptopoffice-repair_hjj0ln.webp",
    "laptop-maintenance": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_auto/q_50/laptop-maintenance_oi0tk0.webp",
    "hero-background": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_auto/q_50/hero-background_ynkel5.webp",
    "logo": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_auto/q_auto:eco/logo_md70dc.webp", // Logo se mantiene en eco para evitar artefactos
    "gpu-repair": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_auto/q_50/gpu-repair_yyggjp.webp",
    "macbook-maintenance": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_auto/q_50/macbook-maintenance_h2qwjz.webp",
    "pc-gamer-setup": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_auto/q_50/pc-gamer-setup_vxoowh.webp",
    "gpu-maintenance": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_auto/q_50/gpu-maintenance_tuaud6.webp",
    "hardware-tools": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_auto/q_50/hardware-tools_bxonku.webp",
  };

  const resolveCloudinarySrc = (inputSrc: string): string => {
    const s = inputSrc.toLowerCase();
    for (const [key, url] of Object.entries(CLOUDINARY_BY_KEY)) {
      if (s.includes(key)) return url;
    }
    return inputSrc; // fallback local si no hay match
  };

  const finalSrc = isLocalhost ? src : resolveCloudinarySrc(src);

  // Generación dinámica de srcSet mejorada para manejar reemplazo de calidad
  const generateSrcSet = () => {
    if (isLocalhost || !finalSrc.includes('res.cloudinary.com')) return undefined;
    
    const widths = breakpoints || [320, 480, 640, 768, 1024, 1280, 1600];
    
    return widths.map(w => {
        // Regex robusto para reemplazar cualquier calidad configurada (q_50, q_auto, etc) por la versión redimensionada
        return `${finalSrc.replace(/\/q_[a-zA-Z0-9:]+/, `/q_50,w_${w},c_limit`)} ${w}w`;
    }).join(', ');
  };

  return (
    <img
      src={finalSrc}
      srcSet={generateSrcSet()}
      sizes={sizes}
      alt={alt}
      width={width}
      height={props.height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      title={title}
      style={style}
      {...props}
    />
  );
};

export default OptimizedImage;
