import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tents | Red Católica de Acogida y Alojamientos para Peregrinos',
  description: 'Plataforma colaborativa que conecta a peregrinos con parroquias, monasterios y hogares de acogida en el camino.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tents',
  },
};

export const viewport: Viewport = {
  themeColor: '#A31D1D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Inter:wght@300;400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="h-full bg-cream-50 text-ink antialiased selection:bg-crimson/20 selection:text-crimson-800">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FAF7F0',
              color: '#1E1E1C',
              border: '1px solid rgba(107, 74, 52, 0.25)',
              borderRadius: '16px',
              boxShadow: '0 10px 25px -4px rgba(107, 74, 52, 0.15)',
              fontSize: '13px',
              fontWeight: 500,
              padding: '12px 18px',
            },
            success: {
              iconTheme: {
                primary: '#A31D1D',
                secondary: '#FAF7F0',
              },
            },
            error: {
              iconTheme: {
                primary: '#DC2626',
                secondary: '#FAF7F0',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
