import { convexQuery } from "@convex-dev/react-query";
import { usePostHog } from "@posthog/react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, ChefHat, Sparkles } from "lucide-react";

import { api } from "@backend/api";
import { QUICK_FEATURES } from "&/preferences/form/constants";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { APP } from "@/configs/app.config";

export const Route = createFileRoute("/(app)/(authed)/welcome")({
	beforeLoad: async ({ context }) => {
		const hasPreferences = await context.queryClient.ensureQueryData(
			convexQuery(api.userPreferences.exists, {}),
		);

		if (hasPreferences) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Welcome />;
}

function Welcome() {
	const posthog = usePostHog();

	const onGetStarted = () => {
		posthog.capture("onboarding_start");
	};

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-primary/5 via-background to-primary/10 p-4">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute top-20 left-10 h-72 w-72 animate-pulse rounded-full bg-primary/10 blur-3xl"></div>
				<div className="absolute right-10 bottom-20 h-96 w-96 animate-pulse rounded-full bg-primary/5 blur-3xl delay-1000"></div>
				<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-125 w-125 animate-spin-slow rounded-full bg-linear-to-r from-primary/5 to-transparent blur-3xl"></div>
			</div>

			<Card className="relative z-10 w-full max-w-3xl border-2 shadow-2xl">
				<CardHeader className="space-y-2 pb-2 text-center">
					<div className="relative mb-4 flex justify-center">
						<div className="absolute inset-0 animate-pulse rounded-3xl bg-primary/20 blur-xl"></div>
						<div className="relative flex h-20 w-20 transform items-center justify-center rounded-3xl bg-linear-to-br from-primary to-primary/70 shadow-2xl transition-transform duration-300 hover:scale-110">
							<ChefHat className="h-12 w-12 animate-bounce-subtle text-primary-foreground" />
						</div>
					</div>
					<div className="space-y-1">
						<CardTitle className="bg-linear-to-r from-primary via-primary/80 to-primary bg-clip-text font-bold text-4xl text-transparent">
							Welcome to {APP.name}!
						</CardTitle>
						<CardDescription className="flex items-center justify-center gap-2 text-lg">
							<Sparkles className="h-4 w-4 text-primary" />
							Let's personalize your cooking experience
							<Sparkles className="h-4 w-4 text-primary" />
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent className="space-y-6 pb-8">
					<div className="fade-in slide-in-from-bottom-8 animate-in space-y-6 duration-700">
						<div className="space-y-4 py-4 text-center">
							<div className="space-y-3">
								<p className="mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed">
									We'll help you discover amazing recipes tailored to your
									tastes, dietary needs, and cooking style. This will only take
									a minute!
								</p>
							</div>
							<div className="grid grid-cols-3 gap-6 pt-8">
								{QUICK_FEATURES.map((feature) => (
									<div
										key={feature.title}
										className="flex flex-col items-center gap-3 rounded-2xl border-2 border-primary/20 bg-linear-to-br from-primary/10 to-primary/5 p-6 shadow-lg transition-transform duration-300 hover:scale-105"
									>
										<div className="animate-bounce-subtle text-5xl">
											{feature.icon}
										</div>
										<p className="text-center font-semibold text-sm">
											{feature.title}
										</p>
										<p className="text-center text-muted-foreground text-xs">
											{feature.description}
										</p>
									</div>
								))}
							</div>
						</div>
						<div className="flex justify-end border-t-2 pt-6">
							<Button
								type="button"
								size="lg"
								onClick={onGetStarted}
								className="gap-2 shadow-lg"
								asChild
							>
								<Link
									to="/preferences"
									search={{ onboarding: true }}
									mask={{ to: "/preferences" }}
								>
									Get Started
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
