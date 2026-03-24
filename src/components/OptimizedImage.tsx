import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width: number;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ src, alt, width, priority = false, className, title, style, sizes, ...props }) => {
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  
  // Genera URL base de Cloudinary
  const getCloudinaryUrl = (w: number) => 
    `https://res.cloudinary.com/demo/image/fetch/f_auto,q_auto,w_${w}/https://quickfix.pe${src}`;

  const finalSrc = isLocalhost 
    ? src 
    : getCloudinaryUrl(width);

  // Genera srcSet para resoluciones responsivas solo en producción
  const generateSrcSet = () => {
    if (isLocalhost) return undefined;
    // Breakpoints estándar
    const widths = [400, 640, 800, 1080, 1200, 1920]; 
    return widths
      .filter(w => w <= width) // Solo generar versiones hasta el ancho máximo original/solicitado
      .map(w => `${getCloudinaryUrl(w)} ${w}w`)
      .join(', ');
  };

  return (
    <img
      src={finalSrc}
      srcSet={generateSrcSet()}
      sizes={sizes} // Permite pasar el atributo sizes desde el padre
      alt={alt}
      width={width}
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
