import packageJson from "../../package.json" with { type: "json" };

export const appConfig = {
	name: packageJson.name,
	dev: {
		/**
		 * ```ts
		 * 3000 + 'plateful:apps:api:*:dev'.split('').map(c => c.charCodeAt(0)).reduce((p, n) => p + n, 0)
		 * ```
		 */
		port: 5204,
	},
} as const;
