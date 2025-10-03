import packageJson from "../../package.json" with { type: "json" };

export const appConfig = {
	name: `@Plateful/${packageJson.name}`,
	/**
	 * ```ts
	 * 4000 + 'Plateful'.split('').map(c => c.charCodeAt(0)).reduce((p, n) => p + n, 0)
	 * ```
	 */
	port: 4829,
} as const;
