import { defineConfig } from "evalite/config";

import vitestConfig from "./vitest.config.mjs";

// biome-ignore lint/style/noDefaultExport: external
export default defineConfig({
	// testTimeout: 60000, // 60 seconds
	// maxConcurrency: 100, // Run up to 100 tests in parallel
	// scoreThreshold: 80, // Fail if average score < 80
	// biome-ignore lint/suspicious/noExplicitAny: //? depends on another version of vitest...
	viteConfig: vitestConfig as any,
	hideTable: false,
	server: {
		port: 3006,
	},
});
