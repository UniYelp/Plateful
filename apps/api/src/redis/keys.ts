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
			user: {
				index: redisKey(
					(userId: string) => `locks:recipes:gen:user:${userId}` as const,
				),
				/**
				 *? Requests per user
				 */
				rpu: redisKey(
					(userId: string) => `locks:recipes:gen:user:${userId}:rpu` as const,
				).$type<RateLimitLockValue>(),
			},
		},
	},
	locks: {
		// TODO: delete
		recipes: {
			generate: {
				user: {
					index: redisKey(
						(userId: string) =>
							`locks:recipes:generate:user:${userId}` as const,
					),
					/**
					 *? Requests per user per day
					 */
					rpu: redisKey(
						(userId: string) =>
							`locks:recipes:generate:user:${userId}:rpu` as const,
					).$type<RateLimitLockValue>(),
				},
			},
		},
	},
} satisfies DeepDict<RedisKeyLike>;
