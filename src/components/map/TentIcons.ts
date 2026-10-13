import L from 'leaflet';
import { AccommodationType } from '@/types/database';

/**
 * Generador de iconos personalizados SVG de "Tents" adaptados a Leaflet
 */
export function createTentMarkerIcon(type: AccommodationType, isExact: boolean): L.DivIcon {
  const isParish = ['parish', 'monastery', 'pilgrim_hostel'].includes(type);
  const bgColor = isParish ? '#A31D1D' : '#6B4A34'; // Carmesí para Iglesia, Madera para particulares
  const accentColor = '#FAF7F0'; // Crema/hueso

  // SVG de Tienda de campaña con cruz litúrgica o fuego de acogida
  const iconSvg = isParish
    ? `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <!-- Cruz pequeña superior -->
        <path d="M12 2v6" />
        <path d="M9 5h6" />
        <!-- Tienda / Templo -->
        <path d="M4 22h16" />
        <path d="M4 22L12 8l8 14" />
        <path d="M12 8v14" />
      </svg>
    `
    : `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <!-- Tienda de acogida familiar -->
        <path d="M3 21h18" />
        <path d="M3 21l9-16 9 16" />
        <path d="M12 5v16" />
        <path d="M9 21v-4a3 3 0 0 1 6 0v4" />
      </svg>
    `;

  const html = `
    <div class="tent-marker-pin relative" style="width: 44px; height: 50px;">
      <div style="
        background: ${bgColor};
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(30, 30, 28, 0.35);
        border: 2.5px solid #FAF7F0;
        margin: auto;
      ">
        <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
          ${iconSvg}
        </div>
      </div>
      ${
        !isExact
          ? `<span style="
              position: absolute;
              bottom: 2px;
              right: 0px;
              background: #543928;
              color: #FAF7F0;
              font-size: 9px;
              font-weight: 700;
              padding: 1px 4px;
              border-radius: 6px;
              border: 1px solid #FAF7F0;
            ">~500m</span>`
          : ''
      }
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-tent-icon',
    iconSize: [44, 50],
    iconAnchor: [20, 48],
    popupAnchor: [0, -44],
  });
}

/**
 * Icono especial para el selector de coordenadas en el registro de anfitrión
 */
export function createPickerMarkerIcon(): L.DivIcon {
  const html = `
    <div style="
      background: #A31D1D;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      border: 3px solid #FAF7F0;
      box-shadow: 0 0 0 6px rgba(163, 29, 29, 0.25), 0 8px 16px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FAF7F0;
      animation: bounce 1.5s infinite;
    ">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'picker-tent-icon',
    iconSize: [46, 46],
    iconAnchor: [23, 46],
  });
}
