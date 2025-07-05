'use client';

import { useState } from 'react';
import { FiSettings, FiSave, FiTrash2, FiDownload } from 'react-icons/fi';
import { useMangaStore } from '@/store/mangaStore';

export default function SettingsPage() {
  const { settings, updateSettings, favorites, readingProgress } = useMangaStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLanguageChange = (language: string, checked: boolean) => {
    const newLanguages = checked
      ? [...localSettings.defaultLanguage, language]
      : localSettings.defaultLanguage.filter(lang => lang !== language);
    
    setLocalSettings(prev => ({
      ...prev,
      defaultLanguage: newLanguages
    }));
  };

  const exportData = () => {
    const data = {
      favorites,
      readingProgress,
      settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manga-reader-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
      if (confirm('Esta acción eliminará todos tus favoritos y progreso de lectura. ¿Continuar?')) {
        localStorage.removeItem('manga-reader-storage');
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <FiSettings className="w-8 h-8 text-purple-400" />
        <h1 className="text-3xl font-bold text-white">Configuración</h1>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Language Settings */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Idiomas Preferidos</h2>
          <p className="text-slate-400 mb-4">
            Selecciona los idiomas en los que prefieres leer mangas. Los resultados se mostrarán en orden de preferencia.
          </p>
          
          <div className="space-y-3">
            {[
              { code: 'en', name: 'Inglés' },
              { code: 'es', name: 'Español' },
              { code: 'ja', name: 'Japonés' },
              { code: 'fr', name: 'Francés' },
              { code: 'de', name: 'Alemán' },
              { code: 'it', name: 'Italiano' },
              { code: 'pt', name: 'Portugués' },
              { code: 'ru', name: 'Ruso' },
              { code: 'zh', name: 'Chino' },
              { code: 'ko', name: 'Coreano' },
            ].map((lang) => (
              <label key={lang.code} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.defaultLanguage.includes(lang.code)}
                  onChange={(e) => handleLanguageChange(lang.code, e.target.checked)}
                  className="form-checkbox h-5 w-5 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                />
                <span className="text-white">{lang.name}</span>
                <span className="text-slate-400 text-sm">({lang.code})</span>
              </label>
            ))}
          </div>
        </div>

        {/* Reader Settings */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Configuración del Lector</h2>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.dataSaver}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, dataSaver: e.target.checked }))}
                className="form-checkbox h-5 w-5 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
              />
              <div>
                <span className="text-white">Modo ahorro de datos</span>
                <p className="text-slate-400 text-sm">Usa imágenes de menor calidad para ahorrar ancho de banda</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.autoMarkAsRead}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, autoMarkAsRead: e.target.checked }))}
                className="form-checkbox h-5 w-5 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
              />
              <div>
                <span className="text-white">Marcar como leído automáticamente</span>
                <p className="text-slate-400 text-sm">Marca los capítulos como leídos cuando los termines</p>
              </div>
            </label>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Gestión de Datos</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white">Exportar datos</span>
                <p className="text-slate-400 text-sm">Descarga una copia de seguridad de tus datos</p>
              </div>
              <button
                onClick={exportData}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-white">Eliminar todos los datos</span>
                <p className="text-slate-400 text-sm">Borra completamente todos tus datos locales</p>
              </div>
              <button
                onClick={clearAllData}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Estadísticas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{favorites.length}</div>
              <div className="text-slate-400">Mangas favoritos</div>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{readingProgress.length}</div>
              <div className="text-slate-400">Mangas con progreso</div>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">
                {favorites.filter(f => f.status === 'reading').length}
              </div>
              <div className="text-slate-400">Leyendo actualmente</div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          <FiSave className="w-5 h-5" />
          <span>{saved ? 'Guardado' : 'Guardar cambios'}</span>
        </button>
      </div>
    </div>
  );
} 