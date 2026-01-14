import { ConvexError } from "convex/values";

import type { CustomConvexError, SuggestedErrorTypes } from "./custom";

export const isConvexError = (err: unknown): err is ConvexError<any> =>
	err instanceof ConvexError;

export const isCustomConvexError = <
	Err extends CustomConvexError<SuggestedErrorTypes, any> = CustomConvexError<
		SuggestedErrorTypes,
		any
	>,
>(
	err: ConvexError<any>,
): err is Err => Array.isArray(err.data) && err.data.length === 2;
