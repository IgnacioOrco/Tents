import React from 'react';
import AppShell from '@/components/layout/AppShell';
import InteractiveMap from '@/components/map/InteractiveMap';
import { INITIAL_MAP_PROPERTIES } from '@/lib/mock-data';

export default function HomePage() {
  return (
    <AppShell>
      <main className="w-full h-full overflow-hidden relative">
        <InteractiveMap initialProperties={INITIAL_MAP_PROPERTIES} />
      </main>
    </AppShell>
  );
}
