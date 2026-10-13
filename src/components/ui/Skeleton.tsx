import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        clsx('animate-pulse rounded-xl bg-wood-200/40', className)
      )}
      {...props}
    />
  );
}

export function MapSkeletonLoader() {
  return (
    <div className="relative w-full h-full bg-cream-100 flex flex-col items-center justify-center overflow-hidden">
      {/* Imitación de mapa con cuadrícula sutil */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6B4A34_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Tarjeta flotante central de carga */}
      <div className="relative z-10 bg-cream-50/95 backdrop-blur-md p-6 rounded-3xl border border-wood-200 shadow-tent max-w-sm w-full mx-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-crimson-100 text-crimson flex items-center justify-center mx-auto animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 2v6" />
            <path d="M9 5h6" />
            <path d="M4 22h16" />
            <path d="M4 22L12 8l8 14" />
          </svg>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-40 mx-auto" />
          <Skeleton className="h-3 w-56 mx-auto" />
        </div>
        <div className="flex gap-2 justify-center pt-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}
