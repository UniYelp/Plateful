import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type PluginOption } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// biome-ignore lint/style/noDefaultExport: external
export default defineConfig({
	server: {
		//? 3000 + 'Plateful'.split('').map(c => c.charCodeAt(0)).reduce((p, n) => p + n, 0)
		port: 3829,
	},
	plugins: [
		tsconfigPaths() as PluginOption,
		tanstackRouter({ autoCodeSplitting: true }),
		react({
			babel: {
				plugins: [["babel-plugin-react-compiler"]],
			},
		}),
		tailwindcss() as PluginOption,
	],
});
