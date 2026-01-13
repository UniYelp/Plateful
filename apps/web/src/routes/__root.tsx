import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import { usePosthogUserSetup } from "@/hooks/usePosthogUserSetup";
import { seo } from "@/utils/seo";

import globalsCss from "@/styles/globals.css?url";
import "@/styles/globals.css";

import type { useAuth } from "@clerk/clerk-react";

type RouterContext = {
	queryClient: QueryClient;
	auth: ReturnType<typeof useAuth>;
};

export const Route = createRootRouteWithContext<RouterContext>()({
	wrapInSuspense: true,
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			...seo({
				description: "🍳 Making Cooking Fun & Easy",
			}),
		],
		links: [
			{
				rel: "stylesheet",
				href: globalsCss,
			},
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/favicon-16x16.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicon-32x32.png",
			},
			{ rel: "icon", href: "/favicon.ico" },
			{ rel: "manifest", href: "/manifest.json", color: "#fffff" },
		],
	}),
	component: RootComponent,
});

function RootComponent() {
	usePosthogUserSetup();

	return (
		<>
			<HeadContent />
			<Outlet />
			<Toaster richColors position="bottom-right" />
			<Scripts />
		</>
	);
}
