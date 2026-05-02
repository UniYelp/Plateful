import { convexQuery } from "@convex-dev/react-query";
import { usePostHog } from "@posthog/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import z from "zod";

import { api } from "@backend/api";
import { PreferencesForm } from "&/preferences/form/PreferencesForm";
import type { PreferencesFormOutput } from "&/preferences/form/schema";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/(app)/(authed)/preferences")({
	validateSearch: z.object({
		onboarding: z.boolean().optional(),
	}),
	loaderDeps: ({ search: { onboarding } }) => ({ onboarding }),
	loader: async ({ context, deps: { onboarding } }) => {
		const { queryClient } = context;

		const hasPreferences = await queryClient.ensureQueryData(
			convexQuery(api.userPreferences.exists, {}),
		);

		if (hasPreferences === onboarding) {
			throw redirect({
				to: "/preferences",
				search: { onboarding: !hasPreferences },
				mask: {
					to: "/preferences",
				},
			});
		}

		return {};
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <PreferencesPage />;
}

export function PreferencesPage() {
	const isOnboarding = Route.useSearch({
		select: ({ onboarding }) => onboarding,
	});

	const navigate = Route.useNavigate();
	const posthog = usePostHog();
	const upsertUserPreferences = useMutation(api.userPreferences.upsert);

	const { data: userPreferences } = useSuspenseQuery(
		convexQuery(api.userPreferences.byActiveUser),
	);

	const onSubmit = async (value: PreferencesFormOutput) => {
		// TODO: handle errors
		await upsertUserPreferences(value);

		if (isOnboarding) {
			posthog.capture("onboarding:preferences_create");
			posthog.capture("onboarding_complete");
		} else {
			posthog.capture("preferences_update", {
				source: "web_page",
			});
		}

		navigate({ to: "/dashboard" });
	};

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-primary/5 via-background to-primary/10 p-4">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute top-20 left-10 h-72 w-72 animate-pulse rounded-full bg-primary/10 blur-3xl"></div>
				<div className="absolute right-10 bottom-20 h-96 w-96 animate-pulse rounded-full bg-primary/5 blur-3xl delay-1000"></div>
				<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-125 w-125 animate-spin-slow rounded-full bg-linear-to-r from-primary/5 to-transparent blur-3xl"></div>
			</div>

			<Card className="relative z-10 w-full max-w-3xl border-2 shadow-2xl">
				<CardContent>
					<PreferencesForm
						submitLabel={isOnboarding ? "Complete Setup" : "Save"}
						defaultValues={userPreferences}
						onSubmit={onSubmit}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
