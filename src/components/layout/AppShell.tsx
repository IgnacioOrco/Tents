'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Map, 
  CalendarCheck2, 
  User, 
  Church, 
  Compass, 
  ShieldCheck, 
  Plus, 
  Menu, 
  X,
  LogIn
} from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';
import TentsLogo from '@/components/brand/TentsLogo';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    {
      label: 'Explorar Mapa',
      href: '/',
      icon: Compass,
      active: pathname === '/',
    },
    {
      label: 'Mis Solicitudes',
      href: '/requests',
      icon: CalendarCheck2,
      active: pathname === '/requests',
    },
    {
      label: 'Ofrecer Espacio',
      href: '/host/register',
      icon: Church,
      active: pathname.startsWith('/host'),
      badge: 'Anfitrión',
    },
    {
      label: 'Mi Perfil',
      href: '/profile',
      icon: User,
      active: pathname === '/profile',
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cream-50 font-sans">
      {/* 1. DESKTOP SIDEBAR (Visible en pantallas lg+) */}
      <aside className="hidden lg:flex flex-col w-64 bg-cream-50 border-r border-wood-200/80 z-30 shadow-tent flex-shrink-0">
        {/* Brand Header con logotipo oficial */}
        <div className="p-4 border-b border-wood-200/60 flex items-center justify-between">
          <TentsLogo variant="compact" size="md" href="/" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
                  item.active
                    ? 'bg-crimson text-cream-50 shadow-sm'
                    : 'text-ink-soft hover:bg-wood-100/60 hover:text-ink'
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    item.active ? 'text-cream-50' : 'text-wood-500'
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.active
                        ? 'bg-cream-50 text-crimson'
                        : 'bg-crimson-100 text-crimson-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Auth / Account Footer */}
        <div className="p-4 border-t border-wood-200/60 bg-cream-100/50">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full bg-white hover:bg-cream-50 border border-wood-200 text-ink text-xs font-bold py-2.5 px-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4 text-crimson" />
            <span>Ingreso Seguro (Magic Link)</span>
          </button>
        </div>
      </aside>

      {/* 2. ÁREA DE CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <div className="flex-1 h-full w-full overflow-hidden pb-16 lg:pb-0">
          {children}
        </div>

        {/* 3. MOBILE BOTTOM NAVIGATION BAR (Visible en móviles y tablets <lg) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream-50/95 backdrop-blur-lg border-t border-wood-200/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(107,74,52,0.12)]">
          <div className="flex items-center justify-around max-w-lg mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-bold transition-all ${
                    item.active
                      ? 'text-crimson scale-105'
                      : 'text-wood-600 hover:text-ink'
                  }`}
                >
                  <div
                    className={`p-1 rounded-xl transition-colors ${
                      item.active ? 'bg-crimson-100/70 text-crimson' : 'text-wood-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="mt-0.5 tracking-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* MODAL DE AUTENTICACIÓN RÁPIDA */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
