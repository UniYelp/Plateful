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
        client: "./src/client/index.ts",
        server: "./src/server/index.ts"
    },
	dts: {
		build: true,
	},
	exports: {
		devExports,
		customExports(exports) {
			// TODO: add prisma exports
			return exports;
		},
	},
});
