import { type CustomConvexError, customError } from "./custom";

type ConflictData = {
	entity: string;
	field: string;
    message?: string;
};

export type ConflictConvexError<T extends ConflictData = ConflictData> =
	CustomConvexError<"Conflict", T>;

export const conflict = <T extends ConflictData = ConflictData>(
	data: T,
): ConflictConvexError<T> => customError("Conflict", data);
