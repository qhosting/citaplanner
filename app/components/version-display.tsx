
'use client';

import { useEffect, useState } from 'react';

interface VersionInfo {
  version: string;
  buildDate: string;
  commit: string;
  environment: string;
}

export function VersionDisplay() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetch('/api/version')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setVersionInfo(data.data);
        }
      })
      .catch(err => console.error('Error al cargar versión:', err));
  }, []);

  if (!versionInfo) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className="bg-gray-800 text-white px-3 py-1.5 rounded-lg shadow-lg text-xs cursor-pointer hover:bg-gray-700 transition-colors"
        onClick={() => setShowDetails(!showDetails)}
      >
        <span className="font-mono">v{versionInfo.version}</span>
        
        {showDetails && (
          <div className="mt-2 pt-2 border-t border-gray-600 space-y-1">
            <div>
              <span className="text-gray-400">Build:</span>{' '}
              <span className="font-mono">{formatDate(versionInfo.buildDate)}</span>
            </div>
            <div>
              <span className="text-gray-400">Commit:</span>{' '}
              <span className="font-mono">{versionInfo.commit.substring(0, 7)}</span>
            </div>
            <div>
              <span className="text-gray-400">Entorno:</span>{' '}
              <span className="font-mono">{versionInfo.environment}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
