import Elysia from "elysia";

import { UnauthorizedError } from "../errors/models/unauthorized";
import { env } from "./env.plugin";

type AuthOptions = {
	header?: string;
};

export const AuthPluginName = "auth.Plugin";

export const auth = ({ header = "x-api-key" }: AuthOptions = {}) =>
	new Elysia({ name: AuthPluginName, seed: { header } })
		.use(env())
		.error({
			UnauthorizedError,
		})
		.macro({
			apiKey: {
				resolve({ headers,  env }) {
					const apiKey = headers[header];

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
