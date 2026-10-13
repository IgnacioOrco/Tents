'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { createPickerMarkerIcon } from '../map/TentIcons';
import { Search, MapPin, Loader2, X } from 'lucide-react';

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onChangeLocation: (lat: number, lng: number, addressDetails?: { city?: string; address?: string }) => void;
}

interface GeocodingResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

function MapClickHandler({ onChangeLocation }: { onChangeLocation: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChangeLocation(
        Number(e.latlng.lat.toFixed(6)),
        Number(e.latlng.lng.toFixed(6))
      );
    },
  });
  return null;
}

function FlyToPosition({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, 15, { duration: 1 });
  }, [position, map]);
  return null;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onChangeLocation,
}: LocationPickerMapProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const markerIcon = createPickerMarkerIcon();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            val
          )}&limit=5&addressdetails=1`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Error buscando ubicación:', err);
      } finally {
        setIsSearching(false);
      }
    }, 450);
  };

  const handleSelectResult = (item: GeocodingResult) => {
    const lat = Number(parseFloat(item.lat).toFixed(6));
    const lng = Number(parseFloat(item.lon).toFixed(6));
    const city = item.address?.city || item.address?.town || item.address?.village || '';
    const road = item.address?.road || '';

    onChangeLocation(lat, lng, { city, address: road });
    setSearchQuery(item.display_name.split(',')[0]);
    setShowDropdown(false);
  };

  return (
    <div className="space-y-2">
      {/* Barra de búsqueda con autocompletado geográfico */}
      <div className="relative z-20">
        <div className="relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-wood-500">
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </div>
          <input
            type="text"
            placeholder="Buscar ciudad, calle, santuario o parroquia..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
            className="w-full pl-9 pr-9 py-2.5 bg-white border border-wood-200 rounded-xl text-xs sm:text-sm text-ink placeholder:text-wood-400 focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
                setShowDropdown(false);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-wood-400 hover:text-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown de autocompletado */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-cream-50 border border-wood-200 rounded-xl shadow-tent-lg max-h-56 overflow-y-auto z-30 divide-y divide-wood-100 animate-in fade-in duration-150">
            {searchResults.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onClick={() => handleSelectResult(item)}
                className="w-full text-left p-3 hover:bg-wood-100/60 transition-colors flex items-start gap-2.5 text-xs text-ink"
              >
                <MapPin className="w-4 h-4 text-crimson flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-relaxed">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contenedor del Mapa */}
      <div className="w-full h-64 rounded-2xl overflow-hidden border-2 border-wood-300 relative shadow-inner z-10">
        <MapContainer
          center={[latitude, longitude]}
          zoom={13}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <FlyToPosition position={[latitude, longitude]} />
          <MapClickHandler onChangeLocation={onChangeLocation} />
          <Marker
            position={[latitude, longitude]}
            icon={markerIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target as L.Marker;
                const position = marker.getLatLng();
                onChangeLocation(
                  Number(position.lat.toFixed(6)),
                  Number(position.lng.toFixed(6))
                );
              },
            }}
          />
        </MapContainer>
        <div className="absolute bottom-2 left-2 right-2 bg-cream-50/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[11px] text-wood-800 font-medium z-10 border border-wood-200 text-center pointer-events-none shadow-sm">
          📍 Haz clic o arrastra el marcador rojo para afinar la posición exacta
        </div>
      </div>
    </div>
  );
}
