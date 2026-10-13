'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, ShieldCheck, Mail, Phone, Trash2, LogOut, CheckCircle2 } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [fullName, setFullName] = useState('Peregrino Santiago');
  const [email, setEmail] = useState('peregrino@tents.org');
  const [diocese, setDiocese] = useState('Archidiócesis de Santiago');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Perfil actualizado correctamente.');
  };

  const handleDeleteAccount = () => {
    if (confirm('¿Estás seguro de que deseas ejercer tu Derecho al Olvido (RGPD)? Tu cuenta y todos los datos asociados serán eliminados en cascada permanentemente.')) {
      setIsDeleting(true);
      setTimeout(() => {
        setIsDeleting(false);
        toast.success('Tu cuenta y datos personales han sido eliminados.');
      }, 1000);
    }
  };

  return (
    <AppShell>
      <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink">
            Mi Perfil de Acogida
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Gestiona tus datos personales, credencial e información de contacto.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-crimson-100 text-crimson flex items-center justify-center font-bold font-serif text-lg">
                {fullName.charAt(0)}
              </div>
              <div>
                <CardTitle>{fullName}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Cuenta Verificada con Magic Link
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <Input
                label="Nombre Completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Correo Electrónico (OTP)"
                type="email"
                value={email}
                disabled
                leftIcon={<Mail className="w-4 h-4" />}
                helperText="Gestionado sin contraseñas a través de enlaces mágicos y Google."
              />

              <Input
                label="Diócesis o Comunidad Parroquial"
                value={diocese}
                onChange={(e) => setDiocese(e.target.value)}
                helperText="Opcional. Ayuda a verificar tu credencial de peregrino."
              />

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" size="sm">
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Zona de Privacidad y Derecho al Olvido */}
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle className="text-crimson text-base flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Derecho al Olvido (RGPD)
            </CardTitle>
            <CardDescription className="text-xs text-red-800">
              Elimina de forma irreversible toda tu información personal, consentimientos firmados y solicitudes de la plataforma Tents.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteAccount}
            >
              Suprimir Definitivamente Mi Cuenta
            </Button>
          </CardContent>
        </Card>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </AppShell>
  );
}
