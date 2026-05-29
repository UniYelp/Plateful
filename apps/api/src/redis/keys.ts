import type { DeepDict } from "@plateful/types";
import type { RedisKeyLike, TypedRedisKey } from "./types/keys";

const redisKey = <const K extends RedisKeyLike>(key: K) =>
	Object.assign(key, {
		$type: <T>(): TypedRedisKey<T, K> => key as TypedRedisKey<T, K>,
	});

export const RedisKeys = {
	ingredients: {
		safety: {
			cache: redisKey(
				(name: string) => `ingredients:safety:cache:${name}` as const,
			).$type<string>(),
		},
	},
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
				),
			},
		},
	},
	receipts: {
		parse: {
			household: {
				lock: redisKey(
					(householdId: string) =>
						`receipts:parse:household:${householdId}:lock` as const,
				),
				rph: redisKey(
					(householdId: string) =>
						`receipts:parse:household:${householdId}:rph` as const,
				),
			},
		},
	},
} satisfies DeepDict<RedisKeyLike>;
