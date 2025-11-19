import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { getRouterName } from "hono/dev";

import { app } from "./app.js";
import { appConfig } from "./configs/app.config.js";

const { port } = appConfig;

const _app = app.use(
	"/favicon.ico",
	serveStatic({ path: "../public/favicon.ico" }),
);

console.log(getRouterName(_app));

serve(
	{
		fetch: _app.fetch,
		port,
	},
	() => console.log(`Server is running on port ${port}`),
);
