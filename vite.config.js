import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {

      '/api': {
        target: `${import.meta.env.VITE_API_BASE_URL}`, // Laravel backend
        changeOrigin: false,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    
  },
});
