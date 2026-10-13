'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Supercluster from 'supercluster';
import { MapProperty } from '@/types/database';
import { createTentMarkerIcon } from './TentIcons';

interface LeafletMapInnerProps {
  properties: MapProperty[];
  selectedProperty: MapProperty | null;
  userLocation: [number, number] | null;
  onSelectProperty: (property: MapProperty | null) => void;
  filterType: 'all' | 'parish' | 'private_home';
}

// Subcomponente para capturar bounds y zoom del mapa y alimentar supercluster
function ClusterController({
  supercluster,
  onBoundsChange,
}: {
  supercluster: Supercluster;
  onBoundsChange: (clusters: Supercluster.PointFeature<Supercluster.AnyProps>[]) => void;
}) {
  const map = useMapEvents({
    moveend: updateClusters,
    zoomend: updateClusters,
  });

  function updateClusters() {
    const bounds = map.getBounds();
    const zoom = map.getZoom();
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];
    const clusters = supercluster.getClusters(bbox, Math.round(zoom));
    onBoundsChange(clusters);
  }

  useEffect(() => {
    updateClusters();
  }, [supercluster]);

  return null;
}

// Subcomponente para centrar el mapa cuando se selecciona una propiedad
function FlyToProperty({ property }: { property: MapProperty | null }) {
  const map = useMap();
  useEffect(() => {
    if (property) {
      map.flyTo([property.latitude, property.longitude], Math.max(map.getZoom(), 14), {
        duration: 1.0,
      });
    }
  }, [property, map]);
  return null;
}

// Subcomponente para centrar en la geolocalización del usuario
function FlyToUser({ userLocation }: { userLocation: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 14, { duration: 1.2 });
    }
  }, [userLocation, map]);
  return null;
}

// Icono animado de posición del peregrino (GPS)
const userLocationIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 28px; height: 28px;">
      <div style="position: absolute; inset: 0; background: #A31D1D; opacity: 0.35; border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 20px; height: 20px; top: 4px; left: 4px; background: #A31D1D; border: 3px solid #FAF7F0; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.35);"></div>
    </div>
  `,
  className: 'user-gps-marker',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function LeafletMapInner({
  properties,
  selectedProperty,
  userLocation,
  onSelectProperty,
  filterType,
}: LeafletMapInnerProps) {
  // Filtrar según el tipo seleccionado en el radar
  const filteredProperties = useMemo(() => {
    if (filterType === 'all') return properties;
    if (filterType === 'parish') {
      return properties.filter((p) => ['parish', 'monastery', 'pilgrim_hostel', 'community_space'].includes(p.type));
    }
    return properties.filter((p) => p.type === 'private_home');
  }, [properties, filterType]);

  // Preparar puntos GeoJSON para supercluster
  const points = useMemo(() => {
    return filteredProperties.map((p) => ({
      type: 'Feature' as const,
      properties: { cluster: false, propertyId: p.id, data: p },
      geometry: {
        type: 'Point' as const,
        coordinates: [p.longitude, p.latitude],
      },
    }));
  }, [filteredProperties]);

  // Instancia de Supercluster
  const clusterIndex = useMemo(() => {
    const cluster = new Supercluster({
      radius: 50,
      maxZoom: 16,
    });
    cluster.load(points);
    return cluster;
  }, [points]);

  const [clusters, setClusters] = useState<Supercluster.PointFeature<Supercluster.AnyProps>[]>([]);
  const mapRef = useRef<L.Map | null>(null);

  // Icono para clusters
  const getClusterIcon = (count: number) => {
    return L.divIcon({
      html: `
        <div style="
          background: #A31D1D;
          color: #FAF7F0;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 3px solid #FAF7F0;
          box-shadow: 0 4px 14px rgba(163, 29, 29, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
        ">
          ${count}
        </div>
      `,
      className: 'cluster-marker',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[42.5987, -5.5671]} // León / Camino de Santiago
        zoom={9}
        scrollWheelZoom={true}
        zoomControl={false} // Desactivamos el zoom default para UI mobile-first limpia
        className="w-full h-full z-0"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <FlyToProperty property={selectedProperty} />
        <FlyToUser userLocation={userLocation} />

        <ClusterController
          supercluster={clusterIndex}
          onBoundsChange={setClusters}
        />

        {/* Marcador de geolocalización del Peregrino */}
        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon} />
        )}

        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const isCluster = cluster.properties.cluster;

          if (isCluster) {
            const pointCount = cluster.properties.point_count;
            const clusterId = cluster.id as number;

            return (
              <Marker
                key={`cluster-${clusterId}`}
                position={[latitude, longitude]}
                icon={getClusterIcon(pointCount)}
                eventHandlers={{
                  click: () => {
                    const expansionZoom = Math.min(
                      clusterIndex.getClusterExpansionZoom(clusterId),
                      17
                    );
                    mapRef.current?.flyTo([latitude, longitude], expansionZoom, {
                      duration: 0.8,
                    });
                  },
                }}
              />
            );
          }

          // Marcador individual
          const prop = cluster.properties.data as MapProperty;

          return (
            <React.Fragment key={prop.id}>
              {/* Radio difuso para hogares particulares (~500m) */}
              {!prop.is_exact_location && (
                <Circle
                  center={[prop.latitude, prop.longitude]}
                  radius={500}
                  pathOptions={{
                    fillColor: '#6B4A34',
                    fillOpacity: 0.14,
                    color: '#6B4A34',
                    weight: 1.5,
                    dashArray: '5, 8',
                  }}
                />
              )}

              {/* Pin personalizado: al hacer clic, despliega el Bottom Sheet en lugar de popup intrusivo */}
              <Marker
                position={[prop.latitude, prop.longitude]}
                icon={createTentMarkerIcon(prop.type, prop.is_exact_location)}
                eventHandlers={{
                  click: () => {
                    onSelectProperty(prop);
                  },
                }}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
