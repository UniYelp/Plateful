import {
	type HonoWithConvex,
	HttpRouterWithHono,
} from "convex-helpers/server/hono";
import { Hono } from "hono";

import type { ActionCtx } from "./_generated/server";
import { webhooksRoute } from "./routes/webhooks";

/**
 * {@link https://stack.convex.dev/hono-with-convex}
 */
const app: HonoWithConvex<ActionCtx> = new Hono();

app.route("/webhooks", webhooksRoute);

export default new HttpRouterWithHono(app);
