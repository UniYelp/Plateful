import type { DeepDict, FN } from "@plateful/types";

type RedisKeyLike = string | FN<string>;

type TypedRedisKey<T, K extends RedisKeyLike> = K extends FN
	? FN<TypedRedisKey<T, ReturnType<K>>, Parameters<K>>
	: K & {
			readonly $type: T;
		};

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
					),
					/**
					 *? Requests per provider per model per key per day
					 */
					rpd: redisKey(
						(provider: string, model: string, key: string) =>
							`agents:providers:${provider}:models:${model}:keys${key}:rpd` as const,
					),
				},
			},
		},
		users: {
			/**
			 *? Requests per user per day
			 */
			rpu: redisKey((userId: string) => `agents:users:${userId}:rpu` as const),
		},
	},
	locks: {
		recipes: {
			generate: {
				user: redisKey(
					(userId: string) => `locks:recipes:generate:user:${userId}` as const,
				),
			},
		},
	},
} satisfies DeepDict<RedisKeyLike>;
