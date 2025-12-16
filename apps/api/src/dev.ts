import { appConfig } from "./configs/app.config";
import { app } from "./server";

const {
	name,
	dev: { port },
} = appConfig;

app.listen(port, ({ hostname, port }) => {
	console.log(`${name} is running at ${hostname}:${port}`);
});
