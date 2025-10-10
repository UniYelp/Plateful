import { defineConfig } from "tsdown";

import tsConfig from "../../tsconfig.base.json" with { type: "json" };

const {
	compilerOptions: {
		customConditions: { 0: devExports },
	},
} = tsConfig;

// biome-ignore lint/style/noDefaultExport: external config
export default defineConfig({
	entry: ["./src/client/index.ts"],
	platform: "browser",
	dts: {
		build: true,
	},
	exports: {
		devExports,
	},
});
