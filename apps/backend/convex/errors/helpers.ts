import { ConvexError, type Value } from "convex/values";

import type { SuggestStr } from "@plateful/types";

type SuggestedErrorTypes = SuggestStr<
	"Not_Found" | "Unauthorized" | "Forbidden"
>;

export type CustomConvexError<
	Type extends SuggestedErrorTypes = SuggestedErrorTypes,
	Data extends Value = null,
> = ConvexError<[type: Type, data: Data]>;

export type ConvexErrorData<Err extends ConvexError<any>> =
	Err extends ConvexError<infer Data> ? Data : never;

export type CustomConvexErrorData<Err extends CustomConvexError> =
	Err extends CustomConvexError<infer _Type, infer Data> ? Data : never;

export const isConvexError = (err: unknown): err is ConvexError<any> =>
	err instanceof ConvexError;

export const isCustomConvexError = <
	Err extends CustomConvexError = CustomConvexError,
>(
	err: ConvexError<any>,
): err is Err => Array.isArray(err.data) && err.data.length === 2;
