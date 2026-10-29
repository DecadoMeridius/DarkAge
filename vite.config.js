import { defineConfig } from 'vite';
// Game code is plain classic scripts in public/js (shared globals, loaded in order by index.html),
// so Vite only serves and copies them; it does not bundle.
// The port is fixed: browser saves are stored per address, so a drifting port would hide your save.
export default defineConfig({ base: './', server: { port: 5173, strictPort: true }, build: { outDir: 'dist', target: 'es2022' } });
