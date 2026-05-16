import { createFileRoute, Outlet } from "@tanstack/react-router";

import { HouseholdLoading } from "&/households/components/loaders/HouseholdLoader";
import { Header } from "@/components/layouts/Header";

export const Route = createFileRoute("/(app)")({
	component: AppLayout,
	pendingComponent: HouseholdLoading,
});

function AppLayout() {
	return (
		<div className="min-h-screen bg-background">
			<Header />
			<Outlet />
		</div>
	);
}
