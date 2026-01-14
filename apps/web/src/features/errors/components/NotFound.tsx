import { Link, type NotFoundRouteProps } from "@tanstack/react-router";
import { ChefHat, Home, Search, Utensils } from "lucide-react";
import { useLayoutEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function NotFound(_: NotFoundRouteProps) {
	const [mounted, setMounted] = useState(false);

	useLayoutEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true);
	}, []);

	return (
		<div className="flex min-h-screen items-center justify-center from-background via-primary/5 to-accent/10 p-4">
			<div className="w-full max-w-2xl space-y-8 text-center">
				{/* Animated cooking pot icon */}
				<div className="relative mx-auto h-32 w-32">
					<div
						className={`absolute inset-0 rounded-full bg-primary/20 blur-2xl transition-opacity duration-1000 ${mounted ? "opacity-100" : "opacity-0"}`}
					/>
					<div
						className={`relative flex h-full w-full transform items-center justify-center rounded-full bg-linear-to-br from-primary to-accent transition-all duration-700 ${mounted ? "rotate-0 scale-100" : "rotate-180 scale-0"}`}
					>
						<ChefHat className="h-16 w-16 text-primary-foreground" />
					</div>
					{/* Floating utensils */}
					<Utensils
						className={`-top-2 -right-2 absolute h-8 w-8 transform text-primary transition-all delay-300 duration-1000 ${mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}
					/>
					<Search
						className={`-bottom-2 -left-2 absolute h-8 w-8 transform text-accent transition-all delay-500 duration-1000 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
					/>
				</div>

				{/* 404 Text */}
				<div className="space-y-4">
					<h1
						className={`bg-linear-to-r from-primary via-accent to-primary bg-clip-text font-bold text-8xl text-transparent transition-all delay-200 duration-700 md:text-9xl ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
					>
						404
					</h1>
					<h2
						className={`font-bold text-3xl text-foreground transition-all delay-300 duration-700 md:text-4xl ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
					>
						Page Not Found
					</h2>
					<p
						className={`mx-auto max-w-md text-lg text-muted-foreground leading-relaxed transition-all delay-400 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
					>
						Oops! It looks like this page wandered off the menu. The recipe
						you're looking for doesn't exist or may have been moved.
					</p>
				</div>

				{/* Action buttons */}
				<div
					className={`flex flex-col items-center justify-center gap-4 transition-all delay-500 duration-700 sm:flex-row ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
				>
					<Button
						size="lg"
						className="w-full bg-linear-to-r from-primary to-accent text-primary-foreground shadow-lg transition-all hover:from-primary/90 hover:to-accent/90 hover:shadow-xl sm:w-auto"
						asChild
					>
						<Link to="/dashboard">
							<Home className="mr-2 h-5 w-5" />
							Back to Dashboard
						</Link>
					</Button>
					<Button
						size="lg"
						variant="outline"
						className="w-full border-2 border-primary/20 bg-transparent hover:border-primary/40 hover:bg-primary/5 sm:w-auto"
						asChild
					>
						<Link to="/">
							<ChefHat className="mr-2 h-5 w-5" />
							Go to Home
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
