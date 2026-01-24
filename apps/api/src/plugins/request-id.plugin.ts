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
}: RequestIdOptions = {}) => {
	const headerKey = header.toLowerCase();

	return new Elysia({ name: RequestIdPluginName, seed: { headerKey } })
		.derive(({ headers }) => {
			const requestId = headers[headerKey] ?? uuid();
			return { requestId };
		})
		.onAfterHandle(({ requestId, set }) => {
			set.headers[headerKey] = requestId;
		})
		.as("scoped");
};
