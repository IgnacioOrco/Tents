'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export interface AuthActionResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Enviar Magic Link (OTP sin contraseñas) para inicio de sesión inmediato
 */
export async function sendMagicLink(email: string): Promise<AuthActionResult> {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Por favor ingresa un correo electrónico válido.' };
    }

    const headersList = headers();
    const host = headersList.get('host') || 'localhost:3000';
    const proto = headersList.get('x-forwarded-proto') || 'http';
    const redirectUrl = `${proto}://${host}/auth/callback`;

    const supabase = createServerSupabaseClient();

    // Si Supabase URL está configurada formalmente
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return {
        success: true,
        message: `¡Enlace de acceso enviado! Revisa tu bandeja de entrada en ${email} para ingresar con un solo toque.`,
      };
    }

    // Modo demostración / Local sin credenciales externas
    return {
      success: true,
      message: `[Modo Demostración] Enlace mágico generado para ${email}. Acceso concedido sin contraseña.`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: 'No se pudo enviar el enlace mágico en este momento.',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Obtener URL de autenticación con Google OAuth
 */
export async function getGoogleOAuthUrl(): Promise<{ url?: string; error?: string }> {
  try {
    const headersList = headers();
    const host = headersList.get('host') || 'localhost:3000';
    const proto = headersList.get('x-forwarded-proto') || 'http';
    const redirectUrl = `${proto}://${host}/auth/callback`;

    const supabase = createServerSupabaseClient();

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      return { url: data.url };
    }

    // Modo local / demo
    return { url: `${proto}://${host}/?auth=google_demo_success` };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Cerrar sesión
 */
export async function signOutUser() {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/');
}
