import type { ConvexError } from "convex/values";

import {
	type ConflictConvexError,
	isCustomConvexError,
	type NotFoundConvexError,
} from "@backend/errors";
import {
	CustomError,
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
} from "../models";
import { ConflictError } from "../models/conflict";

export const handleConvexError = (err: ConvexError<any>) => {
	// TODO: handle validation errors

	if (!isCustomConvexError(err)) {
		return new CustomError({
			message: "An unexpected error occurred",
			data: err.data,
		});
	}

	const [type, { data, incidentId: errorId }] = err.data;

	switch (type) {
		case "NotFound": {
			const error = err as NotFoundConvexError;
			const [, { data }] = error.data;

			return new NotFoundError({
				message: `Could not find the ${data.entity}`,
				data,
				errorId,
			});
		}
		case "Conflict": {
			const error = err as ConflictConvexError;
			const [, { data }] = error.data;
			return new ConflictError({ data, errorId, field: data.field });
		}
		case "Forbidden": {
			return new ForbiddenError({ data, errorId });
		}
		case "Unauthorized": {
			return new UnauthorizedError({ data, errorId });
		}
		default: {
			const err = new CustomError({
				message: "An unexpected error occurred",
				data,
				errorId,
			});

			err.type = type;

			return err;
		}
	}
};
