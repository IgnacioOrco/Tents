import React from 'react';
import AppShell from '@/components/layout/AppShell';
import HostRegistrationFlow from '@/components/forms/HostRegistrationFlow';

export const metadata = {
  title: 'Registro de Anfitrión y Parroquia | Tents',
  description: 'Inscribe tu parroquia, monasterio o casa particular para acoger a peregrinos en camino.',
};

export default function HostRegisterPage() {
  return (
    <AppShell>
      <main className="h-full overflow-y-auto bg-cream-100 py-4">
        <HostRegistrationFlow />
      </main>
    </AppShell>
  );
}
