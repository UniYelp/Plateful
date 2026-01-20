import Elysia from "elysia";

import { dev } from "../../plugins/dev.plugin";

export const devOnly = new Elysia({
	prefix: "dev",
}).use(dev());
