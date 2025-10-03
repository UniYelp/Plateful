import { Redis } from "@upstash/redis";

/**
 * {@link https://upstash.com/blog/query}
 */
export const redis = Redis.fromEnv();
