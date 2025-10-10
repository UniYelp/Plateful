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

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
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
				title: "Plateful",
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
				href: "/logo192.png",
			},
			{ rel: "manifest", href: "/manifest.json", color: "#fffff" },
			{ rel: "icon", href: "/favicon.ico" },
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
