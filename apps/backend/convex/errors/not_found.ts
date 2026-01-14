import { type CustomConvexError, customError } from "./custom";

type NotFoundData = {
	entity: string;
	by?: string;
};

export type NotFoundConvexError<T extends NotFoundData = NotFoundData> =
	CustomConvexError<"NotFound", T>;

export const notFound = <T extends NotFoundData = NotFoundData>(
	data: T,
): NotFoundConvexError<T> => customError("NotFound", data);
