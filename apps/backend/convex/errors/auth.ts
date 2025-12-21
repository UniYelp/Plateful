import { ConvexError, type Value } from "convex/values";

import type { ConvexErrorData, CustomConvexError } from "./helpers";

export type UnauthorizedConvexError<T extends Value = null> = CustomConvexError<
	"Unauthorized",
	T
>;

export type UnauthorizedErrorData<
	Err extends UnauthorizedConvexError<any> = UnauthorizedConvexError,
> = ConvexErrorData<Err>;

export type ForbiddenConvexError<T extends Value = null> = CustomConvexError<
	"Forbidden",
	T
>;

export type ForbiddenErrorData<
	Err extends ForbiddenConvexError<any> = ForbiddenConvexError,
> = ConvexErrorData<Err>;

export const unauthorized = <T extends Value = null>(
	data = null as T,
): UnauthorizedConvexError<T> =>
	new ConvexError(["Unauthorized", data] as const);

export const forbidden = <T extends Value = null>(
	data = null as T,
): ForbiddenConvexError<T> => new ConvexError(["Forbidden", data] as const);
