import { defineProject } from "vitest/config";

/**
 * {@link https://hono.dev/docs/guides/testing}
 */
export default defineProject({
	test: {
		environment: "node",
		setupFiles: "./tests/setup.ts",
	},
});
