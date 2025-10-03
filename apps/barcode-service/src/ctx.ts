import type { ClerkAuthVariables } from "@hono/clerk-auth";
import type { RequestIdVariables } from "hono/request-id";
import type { redis } from "./configs/redis.config.js";

export type AppContext = {
	Variables: RequestIdVariables & ClerkAuthVariables;
};

export type ProtectedRouteContext = {
	Variables: AppContext["Variables"] & {
		redis: typeof redis;
	};
};

export type AppBindings = {
	Bindings: AppContext;
};

export type ProtectedRouteBindings = {
	Bindings: ProtectedRouteContext;
};
