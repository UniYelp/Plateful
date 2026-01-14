import { isConvexError } from "@backend/errors";
import { handleConvexError } from "./handle-convex-error";
import { wrapError } from "./wrap-error";

export const handleError = (err: unknown) => {
	if (!(err instanceof Error)) return wrapError(err);
	if (!isConvexError(err)) return err;
	return handleConvexError(err);
};
