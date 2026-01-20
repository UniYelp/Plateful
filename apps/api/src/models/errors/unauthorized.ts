import { t } from "elysia";

import { HttpStatusCode } from "@plateful/http";

export class UnauthorizedError extends Error {
	static readonly status = HttpStatusCode.UNAUTHORIZED;
	static readonly $response = t.String();

	readonly status = UnauthorizedError.status;
}
