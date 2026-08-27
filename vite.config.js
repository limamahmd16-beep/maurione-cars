import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_CARS_CLOUDINARY_CLOUD_NAME': JSON.stringify('bjlglhaw'),
    'import.meta.env.VITE_CARS_CLOUDINARY_UPLOAD_PRESET': JSON.stringify('maurione'),
  },
});
