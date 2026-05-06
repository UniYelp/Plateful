import { Elysia } from "elysia";

import { LockedError } from "../../models/errors/locked";
import { RateLimitError } from "../../models/errors/rate-limit";
import { auth } from "../../plugins/auth.plugin";
import { logger } from "../../plugins/logger.plugin";
import { redis } from "../../plugins/redis.plugin";
import { RedisKeys } from "../../redis/keys";
import { RedisLocks } from "../../redis/locks";
import { ReceiptsModel } from "./model";
import * as ReceiptService from "./service";

export const receipts = new Elysia({
	prefix: "receipts",
})
	.use(logger())
	.use(auth())
	.use(redis())
	.get(
		"limits",
		async ({ query: { householdId }, getRedis, log }) => {
			log.set({ household: { id: householdId } });

			const redis = getRedis();
			const rphLock = RedisLocks.receipts.parse.household.rph(redis);

			// We use weight 0 to peek at the current state without consuming a token.
			const { limit, remaining, reset } = await rphLock.limit(
				RedisKeys.receipts.parse.household.rph(householdId),
				{ rate: 0 },
			);

			return {
				today: {
					total: limit - remaining,
					max: limit,
				},
				remaining,
				reset,
			};
		},
		{
			query: ReceiptsModel.getLimitsQuery,
			response: ReceiptsModel.getLimitsResponse,
		},
	)
	.post(
		"parse",
		async ({
			query: { householdId, keepOriginalLanguage },
			body: { image },
			getRedis,
			log,
		}) => {
			log.set({ event: { started: true, keepOriginalLanguage } });
			
			const redis = getRedis();

			log.set({ household: { id: householdId } });

			const householdLock = RedisLocks.receipts.parse.household.lock(
				redis,
				householdId,
			);
			try {
				const acquired = await householdLock.acquire();

				log.set({ lock: { household: { acquired } } });

				if (!acquired) {
					log.set({ event: { lock: { failed: true } } });
					throw new LockedError("You may only parse one receipt at a time");
				}
				
				log.set({ event: { lock: { acquired: true } } });

				const rphLock = RedisLocks.receipts.parse.household.rph(redis);

				const {
					success: hasRemaining,
					limit,
					reset,
				} = await rphLock.limit(
					RedisKeys.receipts.parse.household.rph(householdId),
				);

				log.set({ lock: { rph: { hasRemaining, resetAt: reset } } });

				if (!hasRemaining) {
					log.set({ event: { rateLimit: { exceeded: true } } });
					throw new RateLimitError(
						{ limit, resetAt: reset },
						"Household requests limit exceeded",
					);
				}

				log.set({ event: { processing: { converting: true } } });

				const buffer = await image.arrayBuffer();
				const base64 = Buffer.from(buffer).toString("base64");
				const dataUrl = `data:${image.type};base64,${base64}`;

				log.set({ event: { processing: { converted: true } } });

				const result = await ReceiptService.parseReceipt(
					dataUrl,
					keepOriginalLanguage === true ||
						String(keepOriginalLanguage) === "true",
				);
				
				log.set({ event: { done: true } });
				return result;
			} catch (error) {
				log.set({
					event: { error: error instanceof Error ? error.message : String(error) },
				});
				throw error;
			} finally {
				await householdLock.release();
			}
		},
		{
			query: ReceiptsModel.parseReceiptQuery,
			body: ReceiptsModel.parseReceiptBody,
			response: ReceiptsModel.parseReceiptResponse,
		},
	);
