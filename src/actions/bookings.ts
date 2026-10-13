'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { BookingStatus } from '@/types/database';

export interface CreateBookingInput {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  pilgrimCredsInfo?: string;
  message?: string;
}

export interface BookingActionResult {
  success: boolean;
  message: string;
  bookingId?: string;
  revealedDetails?: {
    exactAddress?: string;
    phone?: string;
    exactLatitude?: number;
    exactLongitude?: number;
  };
  error?: string;
}

/**
 * Server Action para que un Peregrino solicite acogida.
 * En esta etapa, el peregrino NO conoce la dirección exacta si el alojamiento es particular.
 */
export async function submitBookingRequest(input: CreateBookingInput): Promise<BookingActionResult> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // ID de prueba si aún no está configurado Supabase auth en local
    const pilgrimId = user?.id || 'demo-pilgrim-uuid';

    // 1. Validaciones básicas
    if (!input.propertyId || !input.checkIn || !input.checkOut) {
      return { success: false, message: 'Faltan campos obligatorios para la reserva.' };
    }

    const checkInDate = new Date(input.checkIn);
    const checkOutDate = new Date(input.checkOut);

    if (checkOutDate < checkInDate) {
      return { success: false, message: 'La fecha de salida no puede ser anterior a la de llegada.' };
    }

    // 2. Inserción en Supabase (o mock de persistencia)
    const { data, error } = await supabase
      .from('bookings_requests')
      .insert({
        property_id: input.propertyId,
        pilgrim_id: pilgrimId,
        check_in: input.checkIn,
        check_out: input.checkOut,
        guests_count: input.guestsCount || 1,
        pilgrim_creds_info: input.pilgrimCredsInfo || null,
        message: input.message || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // Modo demostración sin base de datos activa
      return {
        success: true,
        message: 'Solicitud enviada exitosamente al anfitrión. La dirección exacta se revelará cuando acepte tu solicitud.',
        bookingId: `demo-req-${Date.now()}`
      };
    }

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath('/');
    return {
      success: true,
      message: 'Solicitud enviada exitosamente. Tu solicitud está pendiente de aprobación por el anfitrión.',
      bookingId: data?.id,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: 'Error al procesar la solicitud de reserva.',
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

/**
 * Server Action: El anfitrión aprueba o rechaza la solicitud.
 * AL APROBARLA, se activa el derecho del peregrino a ver la dirección exacta.
 */
export async function updateBookingStatus(
  bookingId: string, 
  status: BookingStatus
): Promise<BookingActionResult> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: booking, error: fetchError } = await supabase
      .from('bookings_requests')
      .select('id, property_id, pilgrim_id, properties (host_id, exact_location, address_text, phone_contact)')
      .eq('id', bookingId)
      .single();

    if (fetchError && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { success: false, message: 'Reserva no encontrada.' };
    }

    // Actualizar estado de la reserva
    const { error: updateError } = await supabase
      .from('bookings_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (updateError && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { success: false, message: updateError.message };
    }

    revalidatePath('/');
    return {
      success: true,
      message: status === 'approved' 
        ? 'Reserva aprobada. La ubicación exacta ha sido compartida con el peregrino.' 
        : `Reserva actualizada a estado: ${status}.`
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: 'Error al actualizar el estado de la reserva.',
      error: err instanceof Error ? err.message : String(err)
    };
  }
}
