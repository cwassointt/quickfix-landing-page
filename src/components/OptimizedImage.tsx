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
  
  const CLOUDINARY_BY_KEY: Record<string, string> = {
    "console-ps5": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto/console-ps5_ctyf97.webp",
    "laptopgamer-repair": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto/laptopgamer-repair_jdsfo1.webp",
    "laptopoffice-repair": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto/laptopoffice-repair_hjj0ln.webp",
    "laptop-maintenance": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto/laptop-maintenance_oi0tk0.webp",
    "hero-background": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto/hero-background_ynkel5.webp",
    "logo": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto/logo_md70dc.webp",
    "gpu-repair": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto/gpu-repair_yyggjp.webp",
    "macbook-maintenance": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto/macbook-maintenance_h2qwjz.webp",
    "pc-gamer-setup": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto/pc-gamer-setup_vxoowh.webp",
    "gpu-maintenance": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto/gpu-maintenance_tuaud6.webp",
    "hardware-tools": "https://res.cloudinary.com/dmegp6gmd/image/upload/f_webp/q_auto/hardware-tools_bxonku.webp",
  };

  const resolveCloudinarySrc = (inputSrc: string): string => {
    const s = inputSrc.toLowerCase();
    for (const [key, url] of Object.entries(CLOUDINARY_BY_KEY)) {
      if (s.includes(key)) return url;
    }
    return inputSrc; // fallback local si no hay match
  };

  const finalSrc = isLocalhost ? src : resolveCloudinarySrc(src);

  // Con URLs fijas de Cloudinary no armamos srcSet dinámico aquí.
  const generateSrcSet = () => undefined;

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
