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
		scalar: "./src/features/scalar/index.ts",
		mass: "./src/features/mass/index.ts",
		volume: "./src/features/volume/index.ts",
		temperature: "./src/features/temperature/index.ts",
	},
	dts: {
		build: true,
	},
	unused: true,
	exports: {
		devExports,
	},
});
