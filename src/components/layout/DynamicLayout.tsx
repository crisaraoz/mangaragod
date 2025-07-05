'use client';

import { useSidebarStore } from '@/store/sidebarStore';

interface DynamicLayoutProps {
  children: React.ReactNode;
}

export function DynamicLayout({ children }: DynamicLayoutProps) {
  const { isCollapsed } = useSidebarStore();

  return (
    <main 
      className={`min-h-screen transition-all duration-300 ease-in-out ${
        isCollapsed 
          ? 'lg:ml-20' // Margen reducido cuando está colapsado (80px)
          : 'lg:ml-64' // Margen normal cuando está expandido (256px)
      }`}
    >
      <div className="p-4 lg:p-6">
        {children}
      </div>
    </main>
  );
} 