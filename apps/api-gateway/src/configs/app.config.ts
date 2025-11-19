import packageJson from "../../package.json" with { type: "json" };

export const appConfig = {
	name: packageJson.name,
	/**
	 * ```ts
	 * 'plateful:apps:api-gateway:*:dev'.split('').map(c => c.charCodeAt(0)).reduce((p, n) => p + n, 0)
	 * ```
	 */
	port: 3003,
} as const;
