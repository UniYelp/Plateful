import type { DeepDict } from "@plateful/types";
import type { RateLimitLockValue } from "./models/rate-limit";
import type { RedisKeyLike, TypedRedisKey } from "./types/keys";

const redisKey = <const K extends RedisKeyLike>(key: K) =>
	Object.assign(key, {
		$type: <T>(): TypedRedisKey<T, K> => key as TypedRedisKey<T, K>,
	});

export const RedisKeys = {
	health: redisKey((id: string) => `health:${id}` as const).$type<true>(),
	recipes: {
		gen: {
			household: {
				lock: redisKey(
					(householdId: string) =>
						`recipes:gen:household:${householdId}:lock` as const,
				),
				/**
				 *? Requests per household
				 */
				rph: redisKey(
					(householdId: string) =>
						`recipes:gen:household:${householdId}:rph` as const,
				).$type<RateLimitLockValue>(),
			},
		},
	},
} satisfies DeepDict<RedisKeyLike>;
