import { t } from "elysia";

export class LockNotAcquired extends Error {
	static readonly status = 423 as const;
	static readonly $response = t.String();

	readonly status = LockNotAcquired.status;
}
