import { createEnv } from "@t3-oss/env-core";
import { /**upstashRedis, */ vercel } from "@t3-oss/env-core/presets-zod";
import { z } from "zod";

export const ENV = createEnv({
	extends: [vercel() /**upstashRedis() */],
	server: {
		// CLERK_PUBLISHABLE_KEY: z.string(),
		// CLERK_SECRET_KEY: z.string(),

		ALLOWED_ORIGINS: z.codec(z.string(), z.url().array(), {
			decode: (val) => val.split(",").map((origin) => origin.trim()),
			encode: (val) => val.join(","),
		}),
	},

	/**
	 * The prefix that client-side variables must have. This is enforced both at
	 * a type-level and at runtime.
	 */
	clientPrefix: undefined,

	client: {},

	/**
	 * What object holds the environment variables at runtime. This is usually
	 * `process.env` or `import.meta.env`.
	 */
	runtimeEnv: process.env,

	/**
	 * By default, this library will feed the environment variables directly to
	 * the Zod validator.
	 *
	 * This means that if you have an empty string for a value that is supposed
	 * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
	 * it as a type mismatch violation. Additionally, if you have an empty string
	 * for a value that is supposed to be a string with a default value (e.g.
	 * `DOMAIN=` in an ".env" file), the default value will never be applied.
	 *
	 * In order to solve these issues, we recommend that all new projects
	 * explicitly specify this option as true.
	 */
	emptyStringAsUndefined: true,
});
