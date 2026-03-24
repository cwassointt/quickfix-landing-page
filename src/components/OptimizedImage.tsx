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
  
  const getCloudinaryUrl = (w: number) => 
    `https://res.cloudinary.com/demo/image/fetch/f_auto,q_auto:good,w_${w}/https://quickfix.pe${src}`;

  const finalSrc = isLocalhost 
    ? src 
    : getCloudinaryUrl(width);

  const generateSrcSet = () => {
    if (isLocalhost) return undefined;
    
    const widths = breakpoints || [360, 480, 640, 800, 1080, 1200, 1920];
    
    return widths
      .filter(w => w <= width)
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
