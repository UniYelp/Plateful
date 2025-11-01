import type { ClerkAuthVariables } from "@hono/clerk-auth";
import type { Context, Next } from "hono";
import { vi } from "vitest";
import type { Variables } from "../src/types.js";

vi.mock("../src/configs/env.config.js", () => ({
	ENV: {
		ALLOWED_ORIGINS: ["http://localhost:3000"],
	},
}));

vi.mock("@hono/clerk-auth", () => {
	return {
		getAuth: () => {
			return {
				userId: "userId",
				isAuthenticated: true,
			};
		},
		clerkMiddleware:
			() =>
			async (
				c: Context<Variables<ClerkAuthVariables>, string, {}>,
				next: Next,
			) => {
				c.set("clerkAuth", vi.fn());
				c.set("clerk", {} as any);
				return next();
			},
	};
});

vi.mock("@upstash/redis", () => {
	return {
		Redis: {
			fromEnv: vi.fn(),
		},
	};
});
