import { Elysia } from "elysia";

import { redis as redisClient } from "../configs/redis.config";

export const RedisPluginName = "redis.Plugin";

export const redis = () =>
	new Elysia({
		name: RedisPluginName,
	}).decorate("redis", redisClient);
