import { parse } from "iso8601-duration";

export const formatDuration = (duration: string): string => {
	// TODO: fix error
	// @ts-expect-error: unrecognized available API
	return new Intl.DurationFormat("en", {
		style: "short",
	}).format(parse(duration));
};
