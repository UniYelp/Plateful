import { t } from "elysia";

import { HttpStatusCode } from "@plateful/http";

export const RateLimitErrorDetailsSchema = t.Object({
	limit: t.Number(),
	resetAt: t.Number(),
});

export type RateLimitErrorDetails = typeof RateLimitErrorDetailsSchema.static;

export const RateLimitErrorResponseSchema = t.Object({
	error: t.String(),
	details: RateLimitErrorDetailsSchema,
	code: t.Number(),
});

export type RateLimitErrorResponse = typeof RateLimitErrorResponseSchema.static;

export class RateLimitError extends Error {
	static readonly status = HttpStatusCode.TOO_MANY_REQUESTS;
	static readonly $response = RateLimitErrorResponseSchema;

	constructor(
		readonly details: RateLimitErrorDetails,
		message: string,
		options?: ErrorOptions,
	) {
		super(message, options);
	}

	readonly status = RateLimitError.status;

	toResponse() {
		return Response.json(
			{
				error: this.message,
				details: this.details,
				code: this.status,
			},
			{
				status: this.status,
			},
		);
	}
}
