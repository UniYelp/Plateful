import { Hono } from "hono";

import type { BarcodeServiceApiSchema } from "@plateful/barcode-service";
import { ENV } from "../configs/env.config.js";
import type { AppBindings } from "../ctx.js";
import { protectedRouteMiddleware } from "../middlewares/protected-route.middleware.js";
import { registerProxyRoute } from "../utils/register-proxy-route.js";

const barcodeRouteProxy = registerProxyRoute(
	"/barcode",
)<BarcodeServiceApiSchema>({
	originUrl: ENV.BARCODE_SERVICE_URL,
	apiKey: ENV.BARCODE_SERVICE_API_KEY,
});

export const apiRoute = new Hono<AppBindings>()
	.use(protectedRouteMiddleware)
	.route(...barcodeRouteProxy);
