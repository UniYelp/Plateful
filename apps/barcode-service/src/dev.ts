import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { appConfig } from "./configs/app.config.js";

const { port } = appConfig;

serve(
	{
		fetch: app.fetch,
		port,
	},
	() => console.log(`Server is running on port ${port}`),
);
