import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), 
    tailwindcss(),
    VitePWA({ 
      registerType: 'autoUpdate',
      manifest: {
        name: 'SmartSales365',
        short_name: 'SS365',
        description: 'El copiloto con IA para gestionar y hacer crecer tu negocio en Bolivia."',
        theme_color: '#3420e9ff',
        start_url: '/',                
        display: 'standalone',
        icons: [
          {
            src: 'Icono365small.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'Icono365small.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separa las librerías más pesadas en sus propios "chunks"
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) {
              return 'vendor-recharts';
            }
            if (id.includes('jspdf')) {
              return 'vendor-jspdf';
            }
            if (id.includes('xlsx')) {
              return 'vendor-xlsx';
            }
            // Separa react y react-dom
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
