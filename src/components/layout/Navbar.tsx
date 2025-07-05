'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiSearch, FiBook, FiStar, FiSettings, FiHome } from 'react-icons/fi';

export function Navbar() {
  const pathname = usePathname();
  
  const navItems = [
    {
      href: '/',
      label: 'Inicio',
      icon: FiHome,
    },
    {
      href: '/search',
      label: 'Buscar',
      icon: FiSearch,
    },
    {
      href: '/library',
      label: 'Mi Biblioteca',
      icon: FiBook,
    },
    {
      href: '/favorites',
      label: 'Favoritos',
      icon: FiStar,
    },
    {
      href: '/settings',
      label: 'Configuración',
      icon: FiSettings,
    },
  ];

  return (
    <nav className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <FiBook className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold text-white">Manga Reader</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'bg-purple-500 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-slate-300 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  pathname === href
                    ? 'bg-purple-500 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
} 