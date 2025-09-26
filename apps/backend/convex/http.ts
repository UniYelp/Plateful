import type { WebhookEvent } from "@clerk/backend";
import { zValidator } from "@hono/zod-validator";
import {
	type HonoWithConvex,
	HttpRouterWithHono,
} from "convex-helpers/server/hono";
import { Hono } from "hono";
import { Webhook, type WebhookRequiredHeaders } from "svix";
import { z } from "zod";
import { internal } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";

/**
 * {@link https://stack.convex.dev/hono-with-convex}
 */
const app: HonoWithConvex<ActionCtx> = new Hono();

const webhooks: HonoWithConvex<ActionCtx> = new Hono();

webhooks.post(
	/**
	 * {@link https://docs.convex.dev/auth/database-auth#configure-the-webhook-endpoint-in-clerk}
	 */
	"/clerk",
	zValidator(
		"header",
		z
			.object({
				"svix-id": z.string(),
				"svix-timestamp": z.string(),
				"svix-signature": z.string(),
			})
			.loose(),
	),
	async (c) => {
		const payloadString = await c.req.text();

		const headers = c.req.valid("header");

		const svixHeaders = {
			"svix-id": headers["svix-id"],
			"svix-timestamp": headers["svix-timestamp"],
			"svix-signature": headers["svix-signature"],
		} satisfies WebhookRequiredHeaders;

		const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
		const event = await verifyWebhookEvent(wh, payloadString, svixHeaders);

		if (!event) {
			return new Response("Error occurred", { status: 400 });
		}

		const ctx = c.env;

		switch (event.type) {
			case "user.created": //? intentional fallthrough
			case "user.updated":
				await ctx.runMutation(internal.users.upsertFromClerk, {
					data: event.data,
				});
				break;
			case "user.deleted": {
				const clerkUserId = event.data.id!;
				await ctx.runMutation(internal.users.deleteFromClerk, {
					clerkUserId,
				});
				break;
			}
			default:
				console.log("Ignored Clerk webhook event", event.type);
		}

		return new Response(null, { status: 200 });
	},
);

app.route("/webhooks", webhooks);

async function verifyWebhookEvent(
	wh: Webhook,
	payloadString: string,
	svixHeaders: WebhookRequiredHeaders,
): Promise<WebhookEvent | null> {
	try {
		return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
	} catch (error) {
		console.error("Error verifying webhook event", error);
		return null;
	}
}

export default new HttpRouterWithHono(app);
