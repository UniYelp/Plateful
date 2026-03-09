import Elysia from "elysia";
import { evlog } from "evlog/elysia";

export { useLogger } from "evlog/elysia";

export const LoggerPluginName = "logger.Plugin";

export const logger = () =>
	new Elysia({ name: LoggerPluginName })
		.use(evlog())
		.onBeforeHandle(({ log, path }) => {
			log.set({ request: { path } });
		})
		.as("global");
