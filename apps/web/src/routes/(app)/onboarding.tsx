import { createFileRoute } from "@tanstack/react-router";

import { OnboardingForm } from "&/onboarding/form/OnboardingForm";
import type { OnboardingFormOutput } from "&/onboarding/form/schema";
export const Route = createFileRoute("/(app)/onboarding")({
	component: RouteComponent,
});

function RouteComponent() {
	return <OnboardingPage />;
}

// TODO: get existing details from DB

export function OnboardingPage() {
	const navigate = Route.useNavigate();

	const onSubmit = async (value: OnboardingFormOutput) => {
		console.log(value);

		// TODO: send to DB

		navigate({ to: "/dashboard" });
	};

	return <OnboardingForm onSubmit={onSubmit} />;
}
