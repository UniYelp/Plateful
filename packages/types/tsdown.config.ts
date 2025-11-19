import { defineConfig } from "tsdown";

import tsConfig from "../../tsconfig.base.json" with { type: "json" };

const {
	compilerOptions: {
		customConditions: { 0: devExports },
	},
} = tsConfig;

// biome-ignore lint/style/noDefaultExport: external
export default defineConfig({
	format: "esm",
	platform: "neutral",
	entry: {
		index: "./src/index.ts",
		experimental: "./src/experimental/index.ts",
	},
	dts: {
		build: true,
	},
	exports: {
		devExports,
	},
});
