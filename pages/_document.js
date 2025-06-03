import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#3b82f6" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VERTIMAR" />
        
        {/* Windows Tiles */}
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Viewport for mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <body>
        <Main />
        <NextScript />
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('✅ SW registrado exitosamente:', registration.scope);
                      
                      // Registrar para Background Sync
                      if ('sync' in registration) {
                        console.log('📡 Background Sync disponible');
                      }
                    })
                    .catch(function(error) {
                      console.log('❌ SW registro falló:', error);
                    });
                });
                
                // Escuchar cambios en la conectividad
                window.addEventListener('online', function() {
                  console.log('🌐 Conectado a internet');
                  // Trigger sync cuando se recupere la conexión
                  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                    navigator.serviceWorker.ready.then(function(registration) {
                      return registration.sync.register('sync-pedidos');
                    }).catch(function(error) {
                      console.log('❌ Error registrando background sync:', error);
                    });
                  }
                });
                
                window.addEventListener('offline', function() {
                  console.log('📱 Modo offline activado');
                });
              }
            `,
          }}
        />
      </body>
    </Html>
  );
}