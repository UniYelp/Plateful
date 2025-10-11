import { defineConfig } from "tsdown";

import tsConfig from "../../tsconfig.base.json" with { type: "json" };

const {
	compilerOptions: {
		customConditions: { 0: devExports },
	},
} = tsConfig;

// biome-ignore lint/style/noDefaultExport: external config
export default defineConfig({
	format: "esm",
	platform: "neutral",
	entry: ["./src/index.ts"],
	dts: {
		build: true,
	},
	exports: {
		devExports,
	},
});
