import { randomUUID } from "node:crypto";
import Elysia, { t } from "elysia";

type Options = {
	uuid?: () => string;
	header?: string;
};

export const RequestIdPluginName = "requestId.Plugin";

export const requestId = ({
	uuid = randomUUID,
	header = "x-request-id",
}: Options = {}) =>
	new Elysia({ name: RequestIdPluginName, seed: { header } })
		.guard({
			schema: "standalone",
			headers: t.Object({
				[header]: t.Optional(t.String()),
			}),
		})
		.derive(({ request }) => {
			const requestId = request.headers.get(header) ?? uuid();
			return { requestId };
		})
		.onAfterHandle(({ requestId, set }) => {
			set.headers[header] = requestId;
		})
		.as("scoped");
