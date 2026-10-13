'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/auth/AuthModal';

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
      <AuthModal
        isOpen={true}
        onClose={() => router.push('/')}
        onSuccess={() => router.push('/')}
      />
    </main>
  );
}
