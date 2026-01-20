import { t } from "elysia";

import { HttpStatusCode } from "@plateful/http";

export class LockedError extends Error {
	static readonly status = HttpStatusCode.LOCKED;
	static readonly $response = t.String();

	readonly status = LockedError.status;
}
