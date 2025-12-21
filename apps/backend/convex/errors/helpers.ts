import { ConvexError, type Value } from "convex/values";

export type CustomConvexError<
	Type extends string = string,
	Data extends Value = null,
> = ConvexError<[type: Type, data: Data]>;

export type ConvexErrorData<Err extends ConvexError<any>> =
	Err extends ConvexError<infer Data> ? Data : never;

export type CustomConvexErrorData<Err extends CustomConvexError> =
	Err extends CustomConvexError<infer _Type, infer Data> ? Data : never;

export const isCustomConvexError = <
	Err extends CustomConvexError = CustomConvexError,
>(
	err: unknown,
): err is Err =>
	err instanceof ConvexError &&
	Array.isArray(err.data) &&
	err.data.length === 2;
