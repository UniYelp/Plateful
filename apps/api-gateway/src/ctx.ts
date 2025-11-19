import type { ClerkAuthVariables } from "@hono/clerk-auth";
import type { RequestIdVariables } from "hono/request-id";

import type { ENV } from "./configs/env.config.js";
import type { Bindings, Variables } from "./types.js";

export type EnvVariables = Variables<{
	env: typeof ENV;
}>;

export type AppVariables = Variables<
	EnvVariables["Variables"] & RequestIdVariables & ClerkAuthVariables
>;

export type EnvBindings = Bindings<EnvVariables>;

export type AppBindings = Bindings<AppVariables>;
