import { defineConfig } from "tsdown";
import tsConfig from "../../tsconfig.base.json" with { type: "json" };

const {
	compilerOptions: {
		customConditions: { 0: devExports },
	},
} = tsConfig;

export default defineConfig({
	entry: ["./src/client/index.ts"],
	platform: "browser",
	dts: true,
	exports: {
		devExports,
	},
});
