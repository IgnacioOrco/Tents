'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapProperty } from '@/types/database';
import { INITIAL_MAP_PROPERTIES } from '@/lib/mock-data';
import { MapSkeletonLoader } from '@/components/ui/Skeleton';
import PropertyBottomSheet from './PropertyBottomSheet';
import { 
  Search, 
  Church, 
  Home, 
  Layers, 
  X, 
  Navigation, 
  LocateFixed, 
  Compass, 
  Plus, 
  Sparkles 
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import TentsLogo from '@/components/brand/TentsLogo';

// Carga dinámica SSR-safe de React Leaflet con Skeleton Loader profesional
const DynamicLeafletMap = dynamic(
  () => import('./LeafletMapInner'),
  {
    ssr: false,
    loading: () => <MapSkeletonLoader />,
  }
);

interface InteractiveMapProps {
  initialProperties?: MapProperty[];
}

export default function InteractiveMap({
  initialProperties = INITIAL_MAP_PROPERTIES,
}: InteractiveMapProps) {
  const [properties] = useState<MapProperty[]>(initialProperties);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'parish' | 'private_home'>('all');
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Filtrado por texto en vivo
  const searchedProperties = properties.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.neighborhood.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  // FAB: Centrar en mi ubicación usando la API del navegador
  const handleLocateMe = () => {
    if (!('geolocation' in navigator)) {
      toast.error('Tu navegador no soporta geolocalización.');
      return;
    }

    setIsLocating(true);
    toast.loading('Detectando tu posición GPS...', { id: 'gps-loc' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords: [number, number] = [
          Number(latitude.toFixed(6)),
          Number(longitude.toFixed(6)),
        ];
        setUserLocation(coords);
        setIsLocating(false);
        toast.success('Ubicación GPS fijada en el mapa', { id: 'gps-loc' });
      },
      (error) => {
        setIsLocating(false);
        console.warn('Error de geolocalización:', error);
        // Fallback agradable si el usuario deniega o está en localhost
        const fallbackCoords: [number, number] = [42.5987, -5.5671]; // León, España
        setUserLocation(fallbackCoords);
        toast.error('Permiso GPS denegado. Posicionando en ruta de peregrinación central.', { id: 'gps-loc' });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-cream-50 flex flex-col">
      {/* 1. BARRA SUPERIOR DE BÚSQUEDA Y RADAR */}
      <header className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-2 pointer-events-none">
        {/* LOGO EN MÓVIL (cuando el sidebar de desktop está oculto) */}
        <div className="lg:hidden w-full flex items-center justify-between pointer-events-auto bg-cream-50/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-tent border border-wood-200/90 mb-1">
          <TentsLogo variant="compact" size="sm" href="/" />
          <Link
            href="/host/register"
            className="text-[11px] font-bold text-crimson bg-crimson-50 px-2.5 py-1 rounded-xl border border-crimson/20 flex items-center gap-1 active:scale-95"
          >
            <Church className="w-3.5 h-3.5" />
            <span>Ofrecer</span>
          </Link>
        </div>

        {/* INPUT DE BÚSQUEDA TIPO RADAR */}
        <div className="w-full sm:max-w-md pointer-events-auto">
          <div className="relative bg-cream-50/95 backdrop-blur-md rounded-2xl shadow-tent border border-wood-200/90 overflow-hidden">
            <Search className="w-4 h-4 text-wood-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Explorar ciudad, parroquia o monasterio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-transparent text-xs sm:text-sm text-ink placeholder:text-wood-400 focus:outline-none font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-wood-400 hover:text-ink text-xs"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* CTA RÁPIDO PARA ESCRITORIO */}
        <div className="hidden sm:flex items-center gap-2 pointer-events-auto">
          <Link
            href="/host/register"
            className="bg-wood hover:bg-wood-600 text-cream-50 text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-tent flex items-center gap-2 transition-all hover:shadow-lg active:scale-95 border border-wood-400/30"
          >
            <Church className="w-4 h-4 text-cream-200" />
            <span>Ofrecer Parroquia / Alojamiento</span>
          </Link>
        </div>
      </header>

      {/* 2. FILTROS RÁPIDOS (PÍLDORAS RADAR) */}
      <div className="absolute top-16 sm:top-20 left-3 right-3 sm:left-4 sm:right-4 z-20 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 backdrop-blur-md ${
              filterType === 'all'
                ? 'bg-crimson text-cream-50 shadow-md ring-2 ring-crimson/30'
                : 'bg-cream-50/90 text-wood-700 hover:bg-cream-100 border border-wood-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Todos ({properties.length})
          </button>

          <button
            onClick={() => setFilterType('parish')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 backdrop-blur-md ${
              filterType === 'parish'
                ? 'bg-crimson text-cream-50 shadow-md ring-2 ring-crimson/30'
                : 'bg-cream-50/90 text-wood-700 hover:bg-cream-100 border border-wood-200'
            }`}
          >
            <Church className="w-3.5 h-3.5" />
            Parroquias
          </button>

          <button
            onClick={() => setFilterType('private_home')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 backdrop-blur-md ${
              filterType === 'private_home'
                ? 'bg-wood text-cream-50 shadow-md ring-2 ring-wood/30'
                : 'bg-cream-50/90 text-wood-700 hover:bg-cream-100 border border-wood-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Hogares (~500m)
          </button>
        </div>
      </div>

      {/* 3. CONTENEDOR DEL MAPA LEAFLET INTERACTIVO */}
      <div className="w-full h-full">
        <DynamicLeafletMap
          properties={searchedProperties}
          selectedProperty={selectedProperty}
          userLocation={userLocation}
          onSelectProperty={setSelectedProperty}
          filterType={filterType}
        />
      </div>

      {/* 4. BOTÓN FLOTANTE (FAB) "CENTRAR EN MI UBICACIÓN" (GPS) */}
      <div className="absolute right-4 bottom-20 lg:bottom-6 z-30 flex flex-col gap-2">
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          title="Centrar en mi ubicación actual"
          aria-label="Centrar en mi ubicación actual"
          className="w-12 h-12 rounded-2xl bg-cream-50 text-crimson hover:bg-cream-100 border border-wood-200 shadow-tent flex items-center justify-center transition-all active:scale-95 hover:shadow-lg disabled:opacity-60"
        >
          <LocateFixed className={`w-5 h-5 ${isLocating ? 'animate-spin text-wood-500' : ''}`} />
        </button>
      </div>

      {/* 5. NATIVE BOTTOM SHEET DESLIZANTE (REEMPLAZA MODALES Y POPUPS INTRUSIVOS) */}
      <PropertyBottomSheet
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  );
}
