'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import './globals.css';



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  useEffect(() => {
    // Inicializar el tracking de navegación
    const initializeNavigationTracking = () => {
      const currentPath = pathname;
      const navigationHistory = sessionStorage.getItem('navigationHistory');
      
      if (!navigationHistory) {
        // Primera carga de la aplicación
        sessionStorage.setItem('navigationHistory', JSON.stringify([currentPath]));
        sessionStorage.setItem('lastNavigationType', 'hard');
      } else {
        const history = JSON.parse(navigationHistory);
        const lastPath = history[history.length - 1];
        
        // Determinar tipo de navegación
        if (lastPath === currentPath) {
          // Misma página = recarga
          sessionStorage.setItem('lastNavigationType', 'hard');
        } else {
          // Diferente página = navegación interna
          sessionStorage.setItem('lastNavigationType', 'soft');
          
          // Actualizar historial (mantener solo las últimas 5 páginas)
          const newHistory = [...history, currentPath];
          if (newHistory.length > 5) {
            newHistory.shift();
          }
          sessionStorage.setItem('navigationHistory', JSON.stringify(newHistory));
        }
      }
    };

    initializeNavigationTracking();
  }, [pathname]);

  return (
    <html lang="es">
       <head>
        {/* Nombre de la app */}
        <title>Congregacion</title>

        {/* Metadata básica */}
        <meta name="description" content="Descripción de mi aplicación" />
        <meta name="author" content="Tu Nombre o Empresa" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* SEO */}
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:title" content="Mi Aplicación" />
        <meta property="og:description" content="Descripción de mi aplicación" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_ES" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}