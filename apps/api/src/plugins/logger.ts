import Elysia from "elysia";

type Options = {
	name?: string;
};

export const LoggerPluginName = "logger.Plugin";

type LogLevel = "info" | "error" | "warn" | "debug" | "log";

export interface Logger {
	info(...args: any[]): void;
	error(...args: any[]): void;
	warn(...args: any[]): void;
	debug(...args: any[]): void;
	log(...args: any[]): void;
}

const createLogger = (name: string): Logger => {
	const formatMessage = (level: LogLevel, ...args: any[]) => {
		const timestamp = new Date().toISOString();
		return [`[${timestamp}] [${level.toUpperCase()}] [${name}]:`, ...args];
	};

	return {
		info: (...args: any[]) => console.info(...formatMessage("info", ...args)),
		error: (...args: any[]) =>
			console.error(...formatMessage("error", ...args)),
		warn: (...args: any[]) => console.warn(...formatMessage("warn", ...args)),
		debug: (...args: any[]) =>
			console.debug(...formatMessage("debug", ...args)),
		log: (...args: any[]) => console.log(...formatMessage("log", ...args)),
	};
};

export const logger = ({ name = "Elysia" }: Options = {}) =>
	new Elysia({ name: LoggerPluginName, seed: { name } })
		.decorate({
			logger: createLogger(name),
		})
		.onBeforeHandle(({ logger, path }) => {
			if (process.env.NODE_ENV === "production") return;
			logger.log(`Incoming request to ${path}`);
		})
		.as("scoped");
