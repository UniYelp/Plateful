import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig, type PluginOption } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    server: {
        port: 3000,
    },
    plugins: [
        tsconfigPaths() as PluginOption,
        tanstackRouter({ autoCodeSplitting: true }),
        viteReact(),
        tailwindcss() as PluginOption,
    ],
});
