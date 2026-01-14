import { notFound, redirect } from "@tanstack/react-router";

import {
	CustomError,
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
} from "&/errors/models";
import { handleError } from "&/errors/utils/handle-error";

type HandleRouteErrorOptions = {
	unauthorizedRedirectPath?: string;
};

export const getRouteErrorHandler =
	(options?: HandleRouteErrorOptions) => (err: unknown) => {
		console.log({ err });
		const error = handleError(err);

		if (!(error instanceof CustomError)) throw error;

		switch (error.type) {
			case NotFoundError.type: {
				throw notFound();
			}
			case ForbiddenError.type: {
				throw error; // TODO: handle case better
			}
			case UnauthorizedError.type: {
				throw redirect({
					to: "/sign-in",
					search: {
						redirect: options?.unauthorizedRedirectPath,
					},
				});
			}
		}

		throw err;
	};
