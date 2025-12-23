import { ConvexError, type Value } from "convex/values";

import type { ConvexErrorData, CustomConvexError } from "./helpers";

export type NotFoundConvexError<T extends Value = null> = CustomConvexError<
	"Not Found",
	T
>;

export type NotFoundErrorData<
	Err extends NotFoundConvexError<any> = NotFoundConvexError,
> = ConvexErrorData<Err>;

export const notFound = <T extends Value = null>(
	data = null as T,
): NotFoundConvexError<T> => new ConvexError(["Not Found", data] as const);
