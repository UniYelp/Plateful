import type { Value } from "convex/values";

import { type CustomConvexError, customError } from "./custom";

export type UnauthorizedConvexError<T extends Value = null> = CustomConvexError<
	"Unauthorized",
	T
>;

export type ForbiddenConvexError<T extends Value = null> = CustomConvexError<
	"Forbidden",
	T
>;

export const unauthorized = <T extends Value = null>(
	data = null as T,
): UnauthorizedConvexError<T> => customError("Unauthorized", data);

export const forbidden = <T extends Value = null>(
	data = null as T,
): ForbiddenConvexError<T> => customError("Forbidden", data);
