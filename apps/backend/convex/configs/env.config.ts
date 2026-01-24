import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const ENV = createEnv({
	extends: [],
	server: {
		//? Api
		API_URL: z.url(),
		//? Auth
		/**
		 * ? The api key from the api service
		 */
		API_KEY: z.string(),
		//? Clerk
		CLERK_JWT_ISSUER_DOMAIN: z.url(),
		CLERK_WEBHOOK_SECRET: z.string(),
		CLERK_SECRET_KEY: z.string(),
		//? GenAi
		GEMINI_API_KEY: z.string(),
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
