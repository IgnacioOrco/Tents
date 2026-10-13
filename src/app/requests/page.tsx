'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  CalendarCheck2, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Church, 
  Home, 
  Eye, 
  EyeOff, 
  Phone, 
  ExternalLink 
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface MockBookingItem {
  id: string;
  propertyName: string;
  type: 'parish' | 'private_home';
  city: string;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'approved' | 'rejected';
  isExactRevealed: boolean;
  address: string;
  phone?: string;
  suggestedDonation: number;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<MockBookingItem[]>([
    {
      id: 'req-01',
      propertyName: 'Parroquia Santa María del Camino',
      type: 'parish',
      city: 'León',
      checkIn: '2026-10-14',
      checkOut: '2026-10-15',
      status: 'approved',
      isExactRevealed: true,
      address: 'Plaza del Grano 4, León',
      phone: '+34 987 23 45 67',
      suggestedDonation: 5,
    },
    {
      id: 'req-02',
      propertyName: 'Hogar Acogedor Familia Martínez (Tents)',
      type: 'private_home',
      city: 'Sahagún',
      checkIn: '2026-10-18',
      checkOut: '2026-10-19',
      status: 'pending',
      isExactRevealed: false,
      address: 'Zona Residencial Oeste (Radio 500m)',
      phone: undefined,
      suggestedDonation: 10,
    },
  ]);

  return (
    <AppShell>
      <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink">
            Mis Solicitudes de Acogida
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Gestiona tus peticiones de hospedaje y consulta las direcciones desbloqueadas por los anfitriones.
          </p>
        </div>

        <div className="space-y-4">
          {requests.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:border-wood-300 transition-all">
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        item.type === 'parish'
                          ? 'bg-crimson-100 text-crimson-700'
                          : 'bg-wood-100 text-wood-700'
                      }`}
                    >
                      {item.type === 'parish' ? <Church className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                      {item.type === 'parish' ? 'Parroquia' : 'Hogar Familiar'}
                    </span>

                    {item.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Aprobada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        <Clock className="w-3 h-3" /> Pendiente de Aprobación
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-ink text-lg">{item.propertyName}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-wood-500" />
                      {item.checkIn} al {item.checkOut}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-wood-500" />
                      {item.city}
                    </span>
                  </div>

                  {/* Detalle de Privacidad y Dirección */}
                  <div className="pt-1">
                    {item.isExactRevealed ? (
                      <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
                        <p className="font-bold flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          Ubicación y Contacto Revelados:
                        </p>
                        <p className="font-medium text-emerald-800">{item.address}</p>
                        {item.phone && (
                          <p className="flex items-center gap-1 text-emerald-700">
                            <Phone className="w-3 h-3" /> {item.phone}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-wood-100/70 border border-wood-200 rounded-xl p-3 text-xs text-wood-800 flex items-start gap-2">
                        <EyeOff className="w-4 h-4 text-wood-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Dirección privada protegida:</p>
                          <p className="text-[11px] text-wood-700">
                            El anfitrión particular aún no ha aprobado la solicitud. La dirección exacta se desbloqueará aquí automáticamente.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-wood-200">
                  <span className="font-bold text-crimson text-sm">
                    {item.suggestedDonation === 0 ? 'Gratuito' : `Donativo: $${item.suggestedDonation}`}
                  </span>
                  <Link href="/">
                    <Button variant="outline" size="sm">
                      Ver en Mapa
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
