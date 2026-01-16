import { t } from "elysia";

import { HttpStatusCode } from "@plateful/http";

export class LockNotAcquiredError extends Error {
	static readonly status = HttpStatusCode.LOCKED;
	static readonly $response = t.String();

	readonly status = LockNotAcquiredError.status;
}
