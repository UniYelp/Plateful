import { Elysia, NotFoundError } from "elysia";

import { env } from "./env.plugin";
import { logger } from "./logger.plugin";

export const DevPluginName = "dev.Plugin";

export const dev = () =>
	new Elysia({
		name: DevPluginName,
	})
		.use(logger())
		.use(env())
		.macro("dev", {
			async resolve({ env, logger }) {
				logger.info("[dev] route accessed");

				if (env.NODE_ENV !== "development") {
					throw new NotFoundError();
				}

				return {};
			},
		});
