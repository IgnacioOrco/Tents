'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { sendMagicLink, getGoogleOAuthUrl } from '@/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Mail, Sparkles, Shield, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const validateEmail = (val: string) => {
    if (!val) {
      setEmailError('El correo electrónico es requerido.');
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val)) {
      setEmailError('Por favor ingresa un correo con formato válido (ej: peregrino@camino.org)');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;

    setIsSendingMagicLink(true);
    const res = await sendMagicLink(email);
    setIsSendingMagicLink(false);

    if (res.success) {
      setIsSent(true);
      toast.success('¡Enlace Mágico enviado a tu correo!');
      if (onSuccess) onSuccess();
    } else {
      toast.error(res.message || 'Error al enviar enlace');
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    toast.loading('Conectando con Google...', { id: 'google-auth' });
    const res = await getGoogleOAuthUrl();
    setIsGoogleLoading(false);
    toast.dismiss('google-auth');

    if (res.url) {
      window.location.href = res.url;
    } else {
      toast.error(res.error || 'No se pudo iniciar sesión con Google.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink-dark/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="max-w-md w-full bg-cream-50 border-wood-200 shadow-2xl relative overflow-hidden">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-wood-500 hover:text-ink p-1.5 rounded-full hover:bg-wood-100/60 transition-colors z-10"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <CardHeader className="text-center pt-7 pb-3 border-none">
          <div className="relative w-24 h-32 mx-auto mb-2 overflow-hidden rounded-2xl bg-cream-50 p-1 border border-wood-200/80 shadow-md">
            <Image
              src="/brand/logo.jpg"
              alt="Logotipo Oficial Tents"
              fill
              priority
              className="object-cover object-top rounded-xl"
            />
          </div>
          <CardTitle className="text-xl">Ingreso Seguro a Tents</CardTitle>
          <CardDescription className="text-xs max-w-xs mx-auto">
            Acceso sin contraseñas para Peregrinos y Anfitriones de acogida cristiana.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 px-6 pb-8 pt-0">
          {isSent ? (
            <div className="text-center py-4 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-serif font-bold text-ink text-base">Revisa tu Bandeja de Entrada</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Hemos enviado un <strong>Enlace Mágico (OTP)</strong> a <strong>{email}</strong>. Haz clic en el enlace para ingresar de forma instantánea.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setIsSent(false);
                  setEmail('');
                }}
              >
                Probar con otro correo
              </Button>
            </div>
          ) : (
            <>
              {/* Opción 1: Google OAuth */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full bg-white hover:bg-stone-50 border border-wood-200 text-ink text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-wood-200 w-full" />
                <span className="bg-cream-50 px-3 text-[11px] font-semibold text-wood-500 uppercase tracking-wider">
                  o con correo directo
                </span>
                <div className="border-t border-wood-200 w-full" />
              </div>

              {/* Opción 2: Magic Link por correo */}
              <form onSubmit={handleMagicLinkSubmit} className="space-y-3">
                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="ejemplo@peregrino.org"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  leftIcon={<Mail className="w-4 h-4" />}
                  error={emailError}
                  helperText="Sin contraseñas que recordar: recibirás un link de un toque."
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={isSendingMagicLink}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Enviar Enlace Mágico
                </Button>
              </form>

              <div className="pt-2 text-center text-[11px] text-wood-600 flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-crimson" />
                <span>Protección criptográfica y privacidad de datos RGPD</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
