export const wrapError = (err: unknown): Error => {
	if (err instanceof Error) return err;
	return new Error(JSON.stringify(err));
};
