import { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  title: string;
  className?: string;
}

export function ResilientImage({ src, alt, title, className = '' }: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const resolvedSrc = src.startsWith('/src/assets/')
    ? `${import.meta.env.BASE_URL}${src.slice(1)}`
    : src;

  if (hasError || !resolvedSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#EFEAE0] text-[#57534E] border border-[#E5DEC9] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Compass className="w-7 h-7 mb-2 text-[#9A3412]/70" aria-hidden="true" />
        <span className="font-serif text-base font-medium text-[#1C1917]">{title}</span>
        <span className="text-xs text-[#78716C] mt-1">Archival visual preview</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
