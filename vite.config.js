import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Repo is hosted at username.github.io/dsa-tracker/
  base: '/dsa-tracker/',
});
