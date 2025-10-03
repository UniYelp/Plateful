import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import {
	type LinkComponentProps,
	RouterProvider,
} from "@tanstack/react-router";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { ENV } from "@/configs/env.config";
import { appConfig } from "./configs/app.config";
import { convexClient } from "./configs/convex.config";
import reportWebVitals from "./reportWebVitals";
import { getRouter } from "./router";

import "./styles.css";

posthog.init(ENV.VITE_PUBLIC_POSTHOG_KEY, {
	api_host: ENV.VITE_PUBLIC_POSTHOG_HOST,
	name: appConfig.platform,
	person_profiles: "always",
	defaults: "2025-05-24",
});

// Create a new router instance
const router = getRouter();

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}

	interface StaticDataRouteOption {
		links?: (LinkComponentProps & {
			label: string;
		})[];
		loader?: React.ReactElement;
	}
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<PostHogProvider client={posthog}>
				<ClerkProvider publishableKey={ENV.VITE_CLERK_PUBLISHABLE_KEY}>
					<ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
						<RouterProvider router={router} />
					</ConvexProviderWithClerk>
				</ClerkProvider>
			</PostHogProvider>
		</StrictMode>,
	);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
