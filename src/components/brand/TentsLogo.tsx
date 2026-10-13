import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface TentsLogoProps {
  variant?: 'full' | 'compact' | 'symbol';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  href?: string;
}

export default function TentsLogo({
  variant = 'compact',
  size = 'md',
  showSubtitle = true,
  className = '',
  href,
}: TentsLogoProps) {
  const dimensions = {
    sm: { width: 32, height: 48, text: 'text-lg', sub: 'text-[9px]' },
    md: { width: 44, height: 64, text: 'text-2xl', sub: 'text-[10px]' },
    lg: { width: 68, height: 98, text: 'text-3xl', sub: 'text-xs' },
    xl: { width: 120, height: 180, text: 'text-5xl', sub: 'text-sm' },
  }[size];

  const content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Emblema oficial: Cruz de madera con tela roja carmesí ondeante */}
      <div className="relative flex-shrink-0 overflow-hidden rounded-xl bg-cream-50 p-0.5 border border-wood-200/50 shadow-sm">
        <Image
          src="/brand/logo.jpg"
          alt="Tents - Cruz y Manto Carmesí"
          width={dimensions.width}
          height={dimensions.height}
          priority
          className="object-cover object-top rounded-lg"
          style={{
            maxHeight: dimensions.height,
            width: 'auto',
          }}
        />
      </div>

      {variant !== 'symbol' && (
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline">
            <span
              className={`font-serif font-black tracking-wider text-ink ${dimensions.text} leading-none`}
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            >
              TENTS
            </span>
          </div>
          {showSubtitle && (
            <span
              className={`tracking-wider uppercase font-semibold text-wood-600 ${dimensions.sub} mt-1`}
            >
              Acogida Católica & Peregrinos
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-transform active:scale-98">
        {content}
      </Link>
    );
  }

  return content;
}
