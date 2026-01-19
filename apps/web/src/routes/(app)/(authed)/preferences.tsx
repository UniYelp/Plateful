import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";

import { api } from "@backend/api";
import { PreferencesForm } from "&/preferences/form/PreferencesForm";
import type { PreferencesFormOutput } from "&/preferences/form/schema";
export const Route = createFileRoute("/(app)/(authed)/preferences")({
	loader: async ({ context }) => {
		const { queryClient } = context;

		const userPreferences = await queryClient.ensureQueryData(
			convexQuery(api.userPreferences.byActiveUser),
		);

		return { userPreferences };
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <PreferencesPage />;
}

export function PreferencesPage() {
	const navigate = Route.useNavigate();
	const upsertUserPreferences = useMutation(api.userPreferences.upsert);

	const { data: userPreferences } = useSuspenseQuery(
		convexQuery(api.userPreferences.byActiveUser),
	);

	const onSubmit = async (value: PreferencesFormOutput) => {
		// TODO: handle errors
		await upsertUserPreferences(value);

		navigate({ to: "/dashboard" });
	};

	return (
		<PreferencesForm onSubmit={onSubmit} defaultValues={userPreferences} />
	);
}
