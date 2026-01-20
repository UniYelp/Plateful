import type { DeepDict } from "@plateful/types";
import type { RateLimitLockValue } from "./models/rate-limit.lock";
import type { RedisKeyLike, TypedRedisKey } from "./types/keys";

const redisKey = <const K extends RedisKeyLike>(key: K) =>
	Object.assign(key, {
		$type: <T>(): TypedRedisKey<T, K> => key as TypedRedisKey<T, K>,
	});

export const RedisKeys = {
	health: redisKey((id: string) => `health:${id}` as const).$type<true>(),
	agents: {
		providers: {
			models: {
				keys: {
					/**
					 *? Requests per provider per model per key per minute
					 */
					rpm: redisKey(
						(provider: string, model: string, key: string) =>
							`agents:providers:${provider}:models:${model}:keys${key}:rpm` as const,
					).$type<RateLimitLockValue>(),
					/**
					 *? Requests per provider per model per key per day
					 */
					rpd: redisKey(
						(provider: string, model: string, key: string) =>
							`agents:providers:${provider}:models:${model}:keys${key}:rpd` as const,
					).$type<RateLimitLockValue>(),
				},
			},
		},
	},
	locks: {
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
