import { SignInButton } from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Monitor, Moon, Sun } from "lucide-react";

import { useAggregatedMatch } from "&/router/hooks/use-aggregated-matches";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import type { FileRouteTypes } from "@/routeTree.gen";
import { UserProfile } from "../user-profile";
import { Brand } from "./Brand";
import { DesktopNav, MobileNav } from "./Navbar";

function ThemeToggle() {
	const { theme, toggleTheme, toggleFullTheme } = useTheme();

	const ThemeIcon =
		theme === "system" ? Monitor : theme === "dark" ? Moon : Sun;

	const handleThemeToggle = (e: React.MouseEvent) => {
		e.preventDefault();
		toggleTheme();
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleFullTheme}
			onContextMenu={handleThemeToggle}
			className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
			aria-label="Toggle theme"
		>
			<ThemeIcon className="h-[1.2rem] w-[1.2rem]" />
		</Button>
	);
}

export function Header() {
	const actions = useAggregatedMatch((data) => data.header?.actions);

	return (
		<header className="sticky top-0 z-50 border-border border-b bg-card/50 backdrop-blur-sm">
			<div className="container mx-auto flex items-center justify-between px-4 py-4">
				<div className="flex flex-1 items-center justify-start">
					<Link to="/dashboard">
						<Brand />
					</Link>
				</div>

				<DesktopNav />

				<div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
					{actions}
					<MobileNav />
					<ThemeToggle />
					<div className="flex min-w-7 items-center gap-3">
						<Unauthenticated>
							<SignInButton
								forceRedirectUrl={
									"/dashboard" satisfies FileRouteTypes["fullPaths"]
								}
							/>
						</Unauthenticated>
						<Authenticated>
							<UserProfile />
						</Authenticated>
						<AuthLoading>
							<p>...</p>
						</AuthLoading>
					</div>
				</div>
			</div>
		</header>
	);
}
