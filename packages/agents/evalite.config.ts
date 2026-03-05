import type { Evalite } from "evalite";
import { defineConfig } from "evalite/config";

import vitestConfig from "./vitest.config.js";

// biome-ignore lint/style/noDefaultExport: external
export default defineConfig({
	// testTimeout: 60000, // 60 seconds
	// maxConcurrency: 100, // Run up to 100 tests in parallel
	// scoreThreshold: 80, // Fail if average score < 80
	viteConfig: vitestConfig,
	hideTable: false,
	server: {
		/**
		 * ```ts
		 * 3000 + 'plateful:packages:agents:eval'.split('').map(c => c.charCodeAt(0)).reduce((p, n) => p + n, 0)
		 * ```
		 */
		port: 5932,
	},
}) as Evalite.Config;
