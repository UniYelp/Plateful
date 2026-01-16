import { randomUUID } from "node:crypto";
import Elysia from "elysia";

type RequestIdOptions = {
	uuid?: () => string;
	header?: string;
};

export const RequestIdPluginName = "requestId.Plugin";

export const requestId = ({
	uuid = randomUUID,
	header = "x-request-id",
}: RequestIdOptions = {}) =>
	new Elysia({ name: RequestIdPluginName, seed: { header } })
		.derive(({ headers }) => {
			const requestId = headers[header] ?? uuid();
			return { requestId };
		})
		.onAfterHandle(({ requestId, set }) => {
			set.headers[header] = requestId;
		})
		.as("scoped");
