const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

if (!code.includes('VitePWA')) {
  code = "import { VitePWA } from 'vite-plugin-pwa';\n" + code;
  code = code.replace(
    'plugins: [react(), tailwindcss()],',
    `plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Aplikasi Kefarmasian Klinis',
          short_name: 'Farmasi Klinis',
          description: 'Aplikasi lengkap untuk Apoteker dan Tenaga Kesehatan',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],`
  );
  fs.writeFileSync('vite.config.ts', code);
  console.log("Updated vite.config.ts with PWA plugin.");
} else {
  console.log("Already configured.");
}
