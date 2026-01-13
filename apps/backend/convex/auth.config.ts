import { ENV } from "./configs/env.config";

// biome-ignore lint/style/noDefaultExport: external
export default {
	providers: [
		{
			/**
			 * {@link https://docs.convex.dev/auth/clerk}
			 */
			// Replace with your own Clerk Issuer URL from your "convex" JWT template
			// or with `process.env.CLERK_JWT_ISSUER_DOMAIN`
			// and configure CLERK_JWT_ISSUER_DOMAIN on the Convex Dashboard
			// See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
			domain: ENV.CLERK_JWT_ISSUER_DOMAIN,
			applicationID: "convex",
		},
	],
};
