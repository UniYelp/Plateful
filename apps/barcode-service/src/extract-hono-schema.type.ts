import type { Hono } from "hono";

export type ExtractHonoSchema<T extends Hono<any, any, any>> = T extends Hono<
	any,
	infer Schema,
	any
>
	? Schema
	: never;
