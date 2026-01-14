import { Elysia } from "elysia";

import { ENV } from "../configs/env.config";

export const EnvPluginName = "env.Plugin";

export const env = () =>
	new Elysia({
		name: EnvPluginName,
	}).decorate("env", ENV);
