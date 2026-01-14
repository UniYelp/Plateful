import { ConvexError, type Value } from "convex/values";

import type { SuggestStr } from "@plateful/types";

export type BaseCustomErrorTypes =
	| "NotFound"
	| "Unauthorized"
	| "Forbidden"
	| "Conflict";

export type SuggestedErrorTypes = SuggestStr<BaseCustomErrorTypes>;

export type CustomErrorDetails<Data extends Value = null> = {
	data: Data;
	incidentId: string;
};

export type CustomConvexError<
	Type extends SuggestedErrorTypes = SuggestedErrorTypes,
	Data extends Value = null,
> = ConvexError<[type: Type, details: CustomErrorDetails<Data>]>;

export type ConvexErrorData<Err extends ConvexError<any>> =
	Err extends ConvexError<infer Data> ? Data : never;

export type CustomConvexErrorData<Err extends CustomConvexError> =
	Err extends CustomConvexError<infer _Type, infer Data> ? Data : never;

export const customError = <
	const Type extends SuggestedErrorTypes,
	const Data extends Value = null,
>(
	type: Type,
	data = null as Data,
): CustomConvexError<Type, Data> =>
	new ConvexError([type, { data, incidentId: crypto.randomUUID() }] as const);
