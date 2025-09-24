import { defineProject } from "vitest/config";

/**
 * {@link https://docs.convex.dev/testing/convex-test}
 */
export default defineProject({
	test: {
		environment: "edge-runtime",
		server: { deps: { inline: ["convex-test"] } },
	},
});
