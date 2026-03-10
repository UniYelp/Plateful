import { file } from "elysia";

import { appConfig } from "./configs/app.config";
import { app } from "./server";

const {
	name,
	dev: { port },
} = appConfig;

app
	.get("/favicon.ico", file("public/favicon.png"))
	.listen(port, ({ hostname, port }) => {
		console.log(`${name} is running at ${hostname}:${port}`);
	});
