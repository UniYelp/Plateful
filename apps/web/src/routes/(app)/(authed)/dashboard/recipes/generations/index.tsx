import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/(app)/(authed)/dashboard/recipes/generations/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return <RecipeGenerationsPage />;
}

function RecipeGenerationsPage() {
	return <div>Hello "/(app)/(authed)/dashboard/recipes/generations/"!</div>;
}
