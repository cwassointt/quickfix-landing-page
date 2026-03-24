import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width: number;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ src, alt, width, priority = false, className, ...props }) => {
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  
  // Si es localhost, usa la imagen normal. Si es producción, inyecta el CDN de Cloudinary.
  const finalSrc = isLocalhost 
    ? src 
    : `https://res.cloudinary.com/demo/image/fetch/f_auto,q_auto,w_${width}/https://quickfix.pe${src}`;

  return (
    <img
      src={finalSrc}
      alt={alt}
      width={width}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      {...props}
    />
  );
};

export default OptimizedImage;

