import { defineConfig } from "tsdown";

import tsConfig from "../../tsconfig.base.json" with { type: "json" };

const {
	compilerOptions: {
		customConditions: { 0: devExports },
	},
} = tsConfig;

export default defineConfig({
	format: "esm",
	platform: "neutral",
	entry: {
		index: "./src/index.ts",
		array: "./src/arr/index.ts",
		enum: "./src/enum/index.ts",
		json: "./src/json/index.ts",
		object: "./src/obj/index.ts",
		string: "./src/str/index.ts",
	},
	dts: {
		build: true,
	},
	exports: {
		devExports,
	},
});
