'use client';

import React, { useState } from 'react';
import { MapProperty } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Church, 
  Home, 
  Users, 
  MapPin, 
  HeartHandshake, 
  ShieldCheck, 
  EyeOff, 
  X, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  Info,
  Calendar
} from 'lucide-react';
import { submitBookingRequest } from '@/actions/bookings';
import toast from 'react-hot-toast';

interface PropertyBottomSheetProps {
  property: MapProperty | null;
  onClose: () => void;
}

export default function PropertyBottomSheet({
  property,
  onClose,
}: PropertyBottomSheetProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [creds, setCreds] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!property) return null;

  const isParish = ['parish', 'monastery', 'pilgrim_hostel', 'community_space'].includes(property.type);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      toast.error('Por favor selecciona las fechas de llegada y salida.');
      return;
    }

    setIsSubmitting(true);
    toast.loading('Enviando solicitud de acogida...', { id: 'booking-sub' });

    const res = await submitBookingRequest({
      propertyId: property.id,
      checkIn,
      checkOut,
      guestsCount: guests,
      pilgrimCredsInfo: creds,
      message,
    });

    setIsSubmitting(false);
    toast.dismiss('booking-sub');

    if (res.success) {
      toast.success(res.message, { duration: 5000 });
      setIsBookingOpen(false);
      onClose();
    } else {
      toast.error(res.message || 'Error al enviar la solicitud.');
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-14 lg:bottom-0 z-40 max-w-xl mx-auto px-3 sm:px-6 pointer-events-none animate-in slide-in-from-bottom-6 duration-300">
      <div className="bg-cream-50/98 backdrop-blur-xl border border-wood-200/90 shadow-[0_-8px_30px_rgba(107,74,52,0.18)] rounded-t-3xl sm:rounded-3xl pointer-events-auto overflow-hidden max-h-[82vh] flex flex-col mb-2 sm:mb-4">
        {/* Barra superior de arrastre / cierre */}
        <div className="pt-2.5 pb-1 px-4 flex items-center justify-between border-b border-wood-100">
          <div className="w-12 h-1.5 bg-wood-300/60 rounded-full mx-auto -mr-2" />
          <button
            onClick={onClose}
            className="text-wood-400 hover:text-ink p-1 rounded-full hover:bg-wood-100 transition-colors"
            aria-label="Cerrar panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido deslizable */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Header con tipo y verificación */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    isParish
                      ? 'bg-crimson-100 text-crimson-700'
                      : 'bg-wood-100 text-wood-700'
                  }`}
                >
                  {isParish ? <Church className="w-3.5 h-3.5" /> : <Home className="w-3.5 h-3.5" />}
                  {isParish ? 'Parroquia / Monasterio' : 'Hogar Familiar (Tents)'}
                </span>

                {property.is_verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verificado
                  </span>
                )}
              </div>

              <h2 className="font-serif font-black text-ink text-lg sm:text-xl leading-tight">
                {property.name}
              </h2>
              <p className="text-xs text-wood-600 font-medium flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-wood-500" />
                {property.city}, {property.neighborhood}
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="text-[10px] uppercase font-bold text-wood-500 block">Acogida</span>
              <span className="font-serif font-black text-crimson text-sm sm:text-base">
                {property.suggested_donation_usd === 0
                  ? 'Gratuita'
                  : `$${property.suggested_donation_usd}`}
              </span>
            </div>
          </div>

          {/* Aviso de privacidad o dirección directa */}
          {!property.is_exact_location ? (
            <div className="bg-wood-100/70 border border-wood-200/80 rounded-2xl p-3 text-xs text-wood-800 flex items-start gap-2.5">
              <EyeOff className="w-4 h-4 text-wood-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Ubicación protegida (~500m):</strong> Por seguridad de la familia, la dirección exacta y teléfono se desbloquean en tu panel tras la confirmación de la solicitud.
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 text-xs text-emerald-900 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Ubicación Pública:</p>
                <p className="font-medium text-emerald-800">{property.address_revealed}</p>
                {property.phone_revealed && (
                  <p className="text-[11px] text-emerald-700 mt-0.5">Tel: {property.phone_revealed}</p>
                )}
              </div>
            </div>
          )}

          {/* Descripción */}
          <p className="text-xs text-ink-muted leading-relaxed">
            {property.description}
          </p>

          {/* Métricas rápidas */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-cream-100/80 p-3 rounded-2xl border border-wood-200/60">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-wood-500" />
              <span>Capacidad: <strong>{property.capacity} plazas</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-crimson" />
              <span>Espíritu: <strong>Fraterno</strong></span>
            </div>
          </div>

          {/* FORMULARIO DE RESERVA DESPLEGABLE DENTRO DEL BOTTOM SHEET */}
          {isBookingOpen ? (
            <form onSubmit={handleBookingSubmit} className="space-y-3 pt-2 border-t border-wood-200 animate-in fade-in duration-200">
              <h4 className="font-serif font-bold text-xs text-ink uppercase tracking-wider flex items-center gap-1.5 text-crimson">
                <Calendar className="w-3.5 h-3.5" /> Fechas y Credencial de Peregrino
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Llegada"
                  type="date"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
                <Input
                  label="Salida"
                  type="date"
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Peregrinos"
                  type="number"
                  min={1}
                  max={property.capacity}
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                  required
                />
                <Input
                  label="Ruta / Credencial"
                  placeholder="Ej: Camino Francés"
                  value={creds}
                  onChange={(e) => setCreds(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-ink-soft">Mensaje de acogida</label>
                <textarea
                  rows={2}
                  placeholder="Hora estimada de llegada y motivo de peregrinación..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-wood-200 bg-white focus:outline-none focus:ring-2 focus:ring-crimson resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBookingOpen(false)}
                  className="w-1/3"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  leftIcon={<HeartHandshake className="w-4 h-4" />}
                  className="w-2/3"
                >
                  Confirmar Solicitud
                </Button>
              </div>
            </form>
          ) : (
            <div className="pt-1">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsBookingOpen(true)}
                leftIcon={<HeartHandshake className="w-4 h-4" />}
                className="w-full shadow-md"
              >
                Solicitar Alojamiento
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
