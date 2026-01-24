import { Elysia, NotFoundError } from "elysia";

import { env } from "./env.plugin";
import { logger } from "./logger.plugin";

type DevPluginOptions = {
	mode?: "always" | "manual";
};

export const DevPluginName = "dev.Plugin";

export const dev = ({ mode = "manual" }: DevPluginOptions = {}) => {
	let plugin = new Elysia({
		name: DevPluginName,
		seed: { mode },
	})
		.use(logger())
		.use(env())
		.macro("dev", {
			async resolve({ env, logger }) {
				logger.info("[dev] route accessed", "{via macro}");

				if (env.NODE_ENV !== "development") {
					throw new NotFoundError();
				}

				return {};
			},
		});

	if (mode === "always") {
		plugin = plugin.onBeforeHandle(({ env, logger }) => {
			if (mode === "always") {
				logger.info("[dev] route accessed", "{via onBeforeHandle}");

				if (env.NODE_ENV !== "development") {
					throw new NotFoundError();
				}
			}
		});
	}

	return plugin;
};
