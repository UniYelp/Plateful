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
			async resolve({ env, log }) {
				log.set({ dev: true });

				if (env.NODE_ENV !== "development") {
					throw new NotFoundError();
				}

				return {};
			},
		});

	if (mode === "always") {
		plugin = plugin.onBeforeHandle(({ env, log }) => {
			log.set({ dev: true });

			if (env.NODE_ENV !== "development") {
				throw new NotFoundError();
			}
		});
	}

	return plugin;
};
