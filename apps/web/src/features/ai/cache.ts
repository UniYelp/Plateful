import type z from "zod";

import type { Maybe } from "@plateful/types";
import {
	AI_RESULT_CACHE_KEY_PREFIX,
	AI_RESULT_DEFAULT_TTL_MS,
} from "./constants";
import type { AIQueryResultCacheItem } from "./types";

type GetOptions<T> = {
	cacheKey: string;
	schema?: z.ZodType<T>;
	forceRefresh?: boolean;
};

type SetOptions<T> = {
	cacheKey: string;
	value: T;
	cacheTTL?: number;
};

export const getCachedAIResult = <T = string>({
	cacheKey,
	schema,
	forceRefresh = false,
}: GetOptions<T>): Maybe<T> => {
	const key = `${AI_RESULT_CACHE_KEY_PREFIX}${cacheKey}`;
	const itemStr = localStorage.getItem(key);

	try {
		if (itemStr) {
			const item = JSON.parse(itemStr) as AIQueryResultCacheItem<T>;
			const now = Date.now();

			// Check if the item has expired
			if (!forceRefresh && now < item.expiry) {
				if (!schema) return item.value;

				// Lightweight safety check before rendering
				const parseResult = schema.safeParse(item.value);
				if (parseResult.success) return parseResult.data;
			} else {
				// Delete the stale entry if the TTL has passed
				localStorage.removeItem(key);
			}
		}
	} catch {
		localStorage.removeItem(key);
	}

	return null;
};

export const setCachedAIResult = <T>({
	cacheKey,
	value,
	cacheTTL = AI_RESULT_DEFAULT_TTL_MS,
}: SetOptions<T>): void => {
	const item: AIQueryResultCacheItem<T> = {
		value,
		expiry: Date.now() + cacheTTL,
	};

	localStorage.setItem(
		`${AI_RESULT_CACHE_KEY_PREFIX}${cacheKey}`,
		JSON.stringify(item),
	);
};
