import crypto from "node:crypto";
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

					if (typeof apiKey !== "string") {
						throw new UnauthorizedError();
					}

					const hashA = crypto.createHash("sha256").update(apiKey).digest();
					const hashB = crypto
						.createHash("sha256")
						.update(env.API_KEY)
						.digest();

					const isValidApiKey = crypto.timingSafeEqual(hashA, hashB);

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
