import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { PostHogProvider } from "@posthog/react";
import { RouterProvider } from "@tanstack/react-router";
import posthog from "posthog-js";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { APP } from "@/configs/app.config";
import { ENV } from "@/configs/env.config";
import reportWebVitals from "./reportWebVitals";
import { getRouter } from "./router";
import type { FileRouteTypes } from "./routeTree.gen";

posthog.init(ENV.VITE_PUBLIC_POSTHOG_KEY, {
	api_host: ENV.VITE_PUBLIC_POSTHOG_HOST,
	name: APP.platform,
	person_profiles: "always",
	defaults: "2026-01-30",
	enable_heatmaps: true,
});

// Create a new router instance
const router = getRouter();

function InnerApp() {
	const auth = useAuth();
	return <RouterProvider router={router} context={{ auth }} />;
}

function App() {
	return (
		<PostHogProvider client={posthog}>
			<ClerkProvider
				publishableKey={ENV.VITE_CLERK_PUBLISHABLE_KEY}
				signInForceRedirectUrl={
					"/dashboard" satisfies FileRouteTypes["fullPaths"]
				}
				signInUrl={"/sign-in" satisfies FileRouteTypes["fullPaths"]}
				signUpForceRedirectUrl={
					"/preferences" satisfies FileRouteTypes["fullPaths"]
				}
				signUpUrl={"/sign-up" satisfies FileRouteTypes["fullPaths"]}
			>
				<InnerApp />
			</ClerkProvider>
		</PostHogProvider>
	);
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
