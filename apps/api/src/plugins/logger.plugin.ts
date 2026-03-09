import Elysia from "elysia";
import { evlog } from "evlog/elysia";

export { useLogger } from "evlog/elysia";

export const LoggerPluginName = "logger.Plugin";

/**
 * @see {@link https://www.evlog.dev/frameworks/elysia}
 */
export const logger = () =>
	new Elysia({ name: LoggerPluginName })
		.use(evlog())
		.onBeforeHandle(({ log, path }) => {
			log.set({ request: { path } });
		})
		.as("global");
