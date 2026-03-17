import {useState, useCallback} from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  srcSet?: string;
  sizes?: string;
  lazy?: boolean;
  placeholder?: string;
  className?: string;
  /** Set to "high" for above-fold LCP candidates */
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Decoding hint — defaults to "async" for lazy images */
  decoding?: 'async' | 'sync' | 'auto';
}

export default function ResponsiveImage({
  src,
  alt,
  width,
  height,
  srcSet,
  sizes,
  lazy = true,
  placeholder,
  className = '',
  fetchPriority,
  decoding,
}: ResponsiveImageProps) {
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{aspectRatio: `${width} / ${height}`}}
    >
      {placeholder && (
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          className={[
            'absolute inset-0 w-full h-full object-cover blur-lg scale-105',
            'transition-opacity duration-base',
            loaded ? 'opacity-0' : 'opacity-100',
          ].join(' ')}
          width={width}
          height={height}
        />
      )}

      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        srcSet={srcSet}
        sizes={sizes}
        loading={lazy ? 'lazy' : 'eager'}
        decoding={decoding ?? (lazy ? 'async' : 'auto')}
        fetchPriority={fetchPriority}
        onLoad={handleLoad}
        className={[
          'w-full h-full object-cover',
          'transition-opacity duration-base',
          placeholder ? (loaded ? 'opacity-100' : 'opacity-0') : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </div>
  );
}
