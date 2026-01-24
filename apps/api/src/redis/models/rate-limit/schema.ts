import { t } from "elysia";

export const RateLimitDetailsSchema = t.Object({
	remaining: t.Number(),
	resetAt: t.Nullable(t.Number()),
});

export type RateLimitDetails = typeof RateLimitDetailsSchema.static;
