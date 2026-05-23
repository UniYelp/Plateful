import Elysia from "elysia";

import { UnauthorizedError } from "../models/errors/unauthorized";
import { env } from "./env.plugin";

type AuthOptions = {
	header?: string;
};

export const AuthPluginName = "auth.Plugin";

export const auth = ({ header = "x-api-key" }: AuthOptions = {}) => {
	const headerKey = header.toLowerCase();

	return new Elysia({ name: AuthPluginName, seed: { headerKey } })
		.use(env())
		.error({
			UnauthorizedError,
		})
		.macro({
			apiKey: {
				resolve({ headers, env }) {
					const apiKey = headers[headerKey];

					const isValidApiKey = apiKey === env.API_KEY;

					if (!isValidApiKey) {
						throw new UnauthorizedError();
					}

					return { apiKey };
				},
				response: {
					[UnauthorizedError.status]: UnauthorizedError.$response,
				},
			},
		});
};
