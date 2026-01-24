import type { FN } from "@plateful/types";

export type RedisKeyLike = string | FN<string>;

export type TypedRedisKey<
	T = unknown,
	K extends RedisKeyLike = RedisKeyLike,
> = K extends FN
	? FN<TypedRedisKey<T, ReturnType<K>>, Parameters<K>>
	: K & {
			readonly $type: T;
		};

export type AnyTypedRedisKey = TypedRedisKey<any>;
