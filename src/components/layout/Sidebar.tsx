'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  FiSearch, 
  FiBook, 
  FiStar, 
  FiSettings, 
  FiHome,
  FiMenu,
  FiX,
  FiTrendingUp,
  FiBookmark,
  FiGrid
} from 'react-icons/fi';
import { useMangaStore } from '@/store/mangaStore';
import { useSidebarStore } from '@/store/sidebarStore';

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, setSidebarCollapsed } = useSidebarStore();
  const { favorites } = useMangaStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const navItems = [
    {
      href: '/',
      label: 'Inicio',
      icon: FiHome,
      description: 'Página principal'
    },
    {
      href: '/search',
      label: 'Explorar',
      icon: FiSearch,
      description: 'Buscar mangas'
    },
    {
      href: '/popular',
      label: 'Populares',
      icon: FiTrendingUp,
      description: 'Mangas más seguidos'
    },
    {
      href: '/library',
      label: 'Biblioteca',
      icon: FiGrid,
      description: 'Mi colección',
      badge: favorites.length > 0 ? favorites.length : undefined
    },
    {
      href: '/favorites',
      label: 'Favoritos',
      icon: FiStar,
      description: 'Mangas favoritos',
      badge: favorites.filter(f => f.status === 'reading').length > 0 
        ? favorites.filter(f => f.status === 'reading').length 
        : undefined
    },
    {
      href: '/reading',
      label: 'Leyendo',
      icon: FiBookmark,
      description: 'Continuar leyendo'
    },
    {
      href: '/settings',
      label: 'Configuración',
      icon: FiSettings,
      description: 'Preferencias'
    }
  ];

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  // Evitar problemas de hidratación
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-slate-900/95 backdrop-blur-md border-r border-slate-700/50 z-50
        transition-all duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'w-72 lg:w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center border-b border-slate-700/50 ${isCollapsed ? 'justify-center p-3' : 'justify-between p-4'}`}>
            {!isCollapsed && (
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <FiBook className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">MangaReader</span>
              </Link>
            )}
            
            {isCollapsed && (
              <button 
                onClick={() => setSidebarCollapsed(false)}
                className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-200"
                title="Expandir sidebar"
              >
                <FiBook className="w-6 h-6 text-white" />
              </button>
            )}
            
            {!isCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="relative z-50 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Colapsar sidebar"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className={`flex-1 ${isCollapsed ? 'px-2 py-4' : 'p-4'}`}>
            <div className="space-y-2">
              {navItems.map(({ href, label, icon: Icon, description, badge }) => (
                <Link
                  key={href}
                  href={href}
                  className={`
                    group relative flex items-center transition-all duration-200 rounded-xl
                    ${isCollapsed 
                      ? 'justify-center p-3 mx-1' 
                      : 'space-x-3 p-3'
                    }
                    ${pathname === href
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }
                  `}
                  title={isCollapsed ? label : undefined}
                >
                  <div className="relative flex-shrink-0">
                    <Icon className={`w-5 h-5 ${pathname === href ? 'text-purple-400' : ''}`} />
                    {badge && !isCollapsed && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                    {badge && isCollapsed && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                  
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-slate-500">{description}</div>
                    </div>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {label}
                      {badge && (
                        <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                          {badge > 99 ? '99+' : badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* User Stats - Moved to bottom */}
          <div className={`${isCollapsed ? 'px-2 py-4' : 'p-4'}`}>
            {!isCollapsed && (
              <div className="p-3 bg-slate-800/30 rounded-xl">
                <div className="text-xs text-slate-400 mb-2">Estadísticas</div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Favoritos:</span>
                  <span className="text-purple-400 font-medium">{favorites.length}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-300">Leyendo:</span>
                  <span className="text-green-400 font-medium">
                    {favorites.filter(f => f.status === 'reading').length}
                  </span>
                </div>
              </div>
            )}

            {/* Collapsed Stats */}
            {isCollapsed && (
              <div className="flex flex-col items-center space-y-2">
                <div className="group relative w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-purple-400 font-bold text-xs">{favorites.length}</span>
                  <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {favorites.length} favoritos
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarCollapsed(false)}
        className={`
          fixed top-4 left-4 z-30 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg lg:hidden
          transition-all duration-300 hover:scale-110
          ${isCollapsed ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}
        `}
        title="Abrir menú"
      >
        <FiMenu className="w-5 h-5" />
      </button>
    </>
  );
} 