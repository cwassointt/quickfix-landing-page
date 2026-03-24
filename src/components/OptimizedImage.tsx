import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width: number;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ src, alt, width, priority = false, className, title, style, sizes, ...props }) => {
  // Detección robusta de entorno local para evitar errores de Cloudinary Fetch con localhost
  const isLocalhost = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('192.168')
  );
  
  // Genera URL base de Cloudinary con compresión mejorada (q_auto:good)
  const getCloudinaryUrl = (w: number) => 
    `https://res.cloudinary.com/demo/image/fetch/f_auto,q_auto:good,w_${w}/https://quickfix.pe${src}`;

  const finalSrc = isLocalhost 
    ? src 
    : getCloudinaryUrl(width);

  // Genera srcSet para resoluciones responsivas solo en producción
  const generateSrcSet = () => {
    if (isLocalhost) return undefined;
    // Breakpoints más granulares para ajustarse mejor a las cajas detectadas por Lighthouse
    const widths = [360, 480, 640, 800, 1080, 1200, 1920]; 
    return widths
      .filter(w => w <= width) // Solo hasta el ancho máximo
      .map(w => `${getCloudinaryUrl(w)} ${w}w`)
      .join(', ');
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
