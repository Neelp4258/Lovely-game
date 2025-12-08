import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'socket.io': ['socket.io-client']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['three', 'socket.io-client', 'firebase/app', 'firebase/auth', 'firebase/firestore']
  }
});
