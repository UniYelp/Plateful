import { Hono } from "hono";

import type { ProtectedRouteBindings } from "../../ctx.js";
import { protectedBindingsMiddleware } from "../../middlewares/protected-bindings.middleware.js";

export const barcodeRoute = new Hono<ProtectedRouteBindings>()
	.use(protectedBindingsMiddleware)
	.get("/", (c) => {
		return c.text("Barcode Service");
	});
