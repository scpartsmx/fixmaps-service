import { PropsWithChildren } from 'react';
import AppLayout from '@/layout/AppLayout';
import { DataProvider } from '@/context/DataContext';

export default function AppWithLayout({ children }: PropsWithChildren) {
  return (
    <DataProvider>
      <AppLayout>{children}</AppLayout>
    </DataProvider>
  );
}
