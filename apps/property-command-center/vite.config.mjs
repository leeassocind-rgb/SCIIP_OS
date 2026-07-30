import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function safeChunkName(value) {
  return value
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function sciipManualChunks(id) {
  const normalized = id.replaceAll('\\\\', '/');

  if (
    normalized.includes('/node_modules/react/') ||
    normalized.includes('/node_modules/react-dom/') ||
    normalized.includes('/node_modules/scheduler/')
  ) return 'vendor-react';

  if (normalized.includes('/node_modules/lucide-react/')) return 'vendor-icons';
  if (normalized.includes('/node_modules/')) return 'vendor-core';

  const componentsMarker = '/src/components/';
  if (normalized.includes(componentsMarker)) {
    const relative = normalized.slice(
      normalized.indexOf(componentsMarker) + componentsMarker.length
    );
    return 'component-' + safeChunkName(relative);
  }

  const srcMarker = '/src/';
  if (normalized.includes(srcMarker)) {
    const relative = normalized.slice(normalized.indexOf(srcMarker) + srcMarker.length);
    const segments = relative.split('/');

    if (segments.length > 1) {
      return 'domain-' + safeChunkName(segments[0]);
    }
  }

  return undefined;
}

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks: sciipManualChunks
      }
    }
  }
});
