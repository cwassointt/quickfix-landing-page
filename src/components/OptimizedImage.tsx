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
  
  // Actualizado a q_auto:eco para mayor compresión (Lighthouse savings)
  const CLOUDINARY_BY_KEY: Record<string, string> = {
    "console-ps5": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto:eco/console-ps5_ctyf97.webp",
    "laptopgamer-repair": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto:eco/laptopgamer-repair_jdsfo1.webp",
    "laptopoffice-repair": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto:eco/laptopoffice-repair_hjj0ln.webp",
    "laptop-maintenance": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto:eco/laptop-maintenance_oi0tk0.webp",
    "hero-background": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto:eco/hero-background_ynkel5.webp",
    "logo": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto:eco/logo_md70dc.webp",
    "gpu-repair": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto:eco/gpu-repair_yyggjp.webp",
    "macbook-maintenance": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto:eco/macbook-maintenance_h2qwjz.webp",
    "pc-gamer-setup": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto:eco/pc-gamer-setup_vxoowh.webp",
    "gpu-maintenance": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto:eco/gpu-maintenance_tuaud6.webp",
    "hardware-tools": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto:eco/hardware-tools_bxonku.webp",
  };

  const resolveCloudinarySrc = (inputSrc: string): string => {
    const s = inputSrc.toLowerCase();
    for (const [key, url] of Object.entries(CLOUDINARY_BY_KEY)) {
      if (s.includes(key)) return url;
    }
    return inputSrc; // fallback local si no hay match
  };

  const finalSrc = isLocalhost ? src : resolveCloudinarySrc(src);

  // Generación dinámica de srcSet inyectando parámetros de ancho y límite en la URL de Cloudinary
  const generateSrcSet = () => {
    if (isLocalhost || !finalSrc.includes('res.cloudinary.com')) return undefined;
    
    const widths = breakpoints || [320, 480, 640, 768, 1024, 1280, 1600];
    
    return widths.map(w => {
        // Reemplaza /q_auto:eco/ con /q_auto:eco,w_{w},c_limit/ para redimensionar en el servidor
        return `${finalSrc.replace('/q_auto:eco/', `/q_auto:eco,w_${w},c_limit/`)} ${w}w`;
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
